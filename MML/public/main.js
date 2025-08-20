const { app, BrowserWindow, ipcMain, shell, dialog, globalShortcut, Menu } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { signIn, getDefaultAccount, checkUsernameExists } = require('./util/loginHandler');
const { getInstalledVersions } = require('./util/installedVersions');
const { getSettings } = require('./util/settings');
const { parseProgress, getAppDataPath } = require('./util/helper');
const { autoUpdater } = require('electron-updater');

let win;
let backendProc;
let isDev = true;
let isDevBuild = false;
let showingApi = false;

const iconPath = path.join(__dirname, 'mml.ico');

function spawnBackend() {
    if (backendProc) return; // don't spawn twice

    backendProc = isDev
        ? spawn('dotnet', ['run', '--project', path.join(process.cwd(), '../MMLCLI/MMLCLI.csproj')])
        : spawn(path.join(__dirname, "backend", "MMLCLI.exe"));

    backendProc.on('error', (err) => {
        console.error('Failed to start C# backend', err);
    });
}

function attachBackendListeners() {
    if (!backendProc) return;

    // Remove any existing listeners to avoid duplicates
    backendProc.stdout.removeAllListeners('data');

    backendProc.stdout.on('data', (data) => {
        console.log(`C# Backend Process: ${data}`);
        const dataString = data.toString();
        switch (true) {
            case dataString.includes("Progress"):
                try {
                    const res = parseProgress(data);
                    const progress = res.progress;
                    const id = res.id;
                    let msg;
                    if (progress !== null) {
                        switch (true) {
                            case dataString.includes("Modpack"):
                                msg = "Downloading Modpack";
                                break;
                            case dataString.includes("Mod"):
                                msg = "Downloading Mods";
                                break;
                            case dataString.includes("Loader"):
                                msg = "Installing ModLoader";
                                break;
                            case dataString.includes("LauncherIn"):
                                msg = "Installing Game Files";
                                break;
                            case dataString.includes("Launch"):
                                msg = "Launching Game";
                                break;
                            case dataString.includes("Extract"):
                                msg = "Extracting Modpack Files";
                                break;
                            case dataString.includes("Copy"):
                                msg = "Copying Version Files";
                                break;
                            default:
                                msg = "Downloading";
                                break;
                        }
                        win.webContents.send('update-progress', progress, id, msg);
                    }
                } catch (error) {
                    console.log(error);
                }
                break;

            case dataString.includes("Install-Complete"):
                win.webContents.send("install-complete", dataString.split(' ')[1]);
                break;
            case dataString.includes("uninstall-complete"):
                win.webContents.send("uninstall-complete", dataString.split(' ')[1]);
                break;
            case dataString.includes("no-account"):
                win.webContents.send("error-launching", dataString.split(' ')[0]);
                showErrorMessage("Not signed in. Please sign-in to your Microsoft account.");
                break;
            case dataString.includes("error-launching"):
                win.webContents.send("error-launching", dataString.split(' ')[0]);
                showErrorMessage("Error launching game. Please confirm you are signed-in and have selected a version.");
                break;
            case dataString.includes("game-launched"):
                win.webContents.send("game-launched", dataString.split(' ')[0]);
                var settings = getSettings();
                if (settings.MinimizeLauncher === true) {
                    win.minimize();
                } else if (settings.ExitLauncher === true) {
                    app.quit();
                }
                break;
            case dataString.includes("game-closed"):
                win.webContents.send("game-closed", dataString.split(' ')[0]);
                win.show();
                break;
        }
    });
}

function createWindow(showTitleBar = false) {
    const initialWidth = 1600;
    const initialHeight = 900;

    const options = {
        width: initialWidth,
        height: initialHeight,
        minWidth: 900,
        minHeight: 508,
        autoHideMenuBar: true,
        resizable: true,
        icon: iconPath,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: false,
            enablePreferredSizeMode: true,
            zoomFactor: 1.0
        },
    };

    if (!showTitleBar) {
        options.titleBarStyle = 'hidden';
        options.trafficLightPosition = { x: -20, y: -20 };
    }

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Switch to Launcher',
            click: () => {
                showingApi = false;
                win.close();
                createWindow(false);
            }
        }
    ]);

    win = new BrowserWindow(options);

    if (!showTitleBar) {
        win.setAspectRatio(1.77);
    } else {
        win.setAspectRatio(0);
    }

    win.webContents.on('before-input-event', (event, input) => {
        const disabledShortcuts = [
            'Tab',
            'Alt',
            'Control+-',
            'Control+=',
            'Control+Plus',
        ];
        const shortcut = `${input.control ? 'Control+' : ''}${input.shift ? 'Shift+' : ''}${input.key}`;
        if (disabledShortcuts.includes(shortcut)) {
            event.preventDefault();
        }
    });

    // Attach backend output to the new window
    attachBackendListeners();

    if (isDevBuild) {
        if (showingApi) {
            win.loadURL('https://minecraftmigos.tech');
        } else {
            if (isDev) {
                win.loadURL("http://localhost:5173/");
            } else {
                win.loadURL(`file://${path.join(__dirname, 'index.html')}`);
            }
        }
    } else {
        isDev ? win.loadURL("http://localhost:5173/") : win.loadURL(`file://${path.join(__dirname, 'index.html')}`);
    }

    win.webContents.on('did-finish-load', () => {
        win.webContents.insertCSS(`
            .titlebar-overlay .titlebar-button {
                display: none !important;
            }
        `);
    });

    if (showingApi) {
        win.webContents.on('context-menu', (event) => {
            contextMenu.popup({ window: win, x: event.x, y: event.y });
        });
    }
}

app.on('ready', function () {
    spawnBackend();
    createWindow(false);
    autoUpdater.checkForUpdates();
});

autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
        type: 'info',
        title: 'Update ready',
        message: 'A new update is ready. Restart the application to apply the updates.',
        buttons: ['Restart', 'Later']
    }).then(result => {
        if (result.response === 0) {
            autoUpdater.quitAndInstall(false, true);
        }
    });
});

const showErrorMessage = (message) => {
    dialog.showMessageBox(win, {
        type: 'error',
        title: 'Uh Oh!',
        message: message,
        buttons: ['OK'],
        icon: iconPath
    });
};

// IPC handlers
ipcMain.on('get-installed-versions', (event) => {
    event.reply('installed-versions', getInstalledVersions());
});

ipcMain.on('get-settings', (event) => {
    event.reply('settings', getSettings());
});

ipcMain.on('download-modpack', (event, arg) => {
    backendProc.stdin.write(`download-modpack ${arg} \n`);
});

ipcMain.on('download-lite-modpack', (event, arg) => {
    backendProc.stdin.write(`download-lite-modpack ${arg} \n`);
});

ipcMain.on('delete-modpack', (event, arg) => {
    backendProc.stdin.write(`delete-modpack ${JSON.stringify(arg)}\n`);
});

ipcMain.on('launch-game', (event, arg) => {
    backendProc.stdin.write(`launch-game ${arg}\n`);
});

ipcMain.on('exit-game', (event, arg) => {
    backendProc.stdin.write(`exit-game ${arg}\n`);
});

ipcMain.on('cancel-game', (event, arg) => {
    backendProc.stdin.write(`cancel-game ${arg}\n`);
});

ipcMain.on('sign-in', async (event) => {
    let UserAccount = await signIn();
    if (UserAccount == null) {
        UserAccount = await signIn();
    }
    if (UserAccount) {
        isDevBuild = await checkUsernameExists(UserAccount.MSession.Username);
        win.webContents.send('isDevBuild', isDevBuild);
        backendProc.stdin.write(`sign-in ${JSON.stringify(UserAccount)} \n`);
        event.reply('sign-in-reply', UserAccount);
    } else {
        event.reply('sign-in-failed', "Sign-in failed");
    }
});

ipcMain.on('sign-out', (event, arg) => {
    backendProc.stdin.write(`sign-out ${arg}\n`);
});

ipcMain.on('change-setting', (event, arg) => {
    backendProc.stdin.write(`change-setting ${arg[0]} ${arg[1]} \n`);
});

ipcMain.on('show-error', (event, arg) => {
    showErrorMessage(arg);
});

ipcMain.on('open-folder', (event, p) => {
    shell.openPath(path.join(getAppDataPath(), "Minecraft", "Instances", p));
});

ipcMain.on('open-website', (event, url) => {
    shell.openExternal(url);
});

ipcMain.on('close-window', () => {
    win.close();
});

ipcMain.on('minimize-window', () => {
    win.minimize();
});

ipcMain.on('maximize-window', () => {
    win.isMaximized() ? win.unmaximize() : win.maximize();
});

ipcMain.on('toggle-maximize', () => {
    if (win.isMaximized()) {
        win.unmaximize();
    } else {
        win.maximize();
    }
});

ipcMain.on('get-version', (event) => {
    event.reply('version', app.getVersion());
});

ipcMain.on('show-api', () => {
    showingApi = true;
    win.close();
    createWindow(true);
});
