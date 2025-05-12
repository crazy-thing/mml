const { app, BrowserWindow, ipcMain, shell, dialog, globalShortcut} = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { signIn, getDefaultAccount } = require('./util/loginHandler');
const { getInstalledVersions } = require('./util/installedVersions');
const { getSettings } = require('./util/settings');
const { parseProgress, getAppDataPath } = require('./util/helper');
const { autoUpdater } = require('electron-updater');
const { sign } = require('crypto');

let win;
let isDev = true;

const iconPath = path.join(__dirname, 'mml.ico');
function createWindow() {

    const initialWidth = 1600; //1600
    const initialHeight = 900; //900
    const ratio = initialWidth / initialHeight;

    win = new BrowserWindow({
        width: initialWidth,
        height: initialHeight,
        minWidth: 900,
        minHeight: 508,
        autoHideMenuBar: true,
        resizable: true,
        titleBarStyle: 'hidden',
        icon: iconPath,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: isDev,
            enablePreferredSizeMode: true,
            zoomFactor: 1.0
        },
    });


    win.setAspectRatio(1.77); //1.77

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
    
    

    backendProc = isDev ? spawn('dotnet', ['run', '--project', path.join(process.cwd(), '../MMLCLI/MMLCLI.csproj')]) :  spawn(path.join(__dirname, "backend", "MMLCLI.exe")); // MMLCLI for linux and macos

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
                    } else {
                        console.log("No progress change detected");
                    }
                } catch (error) {
                    console.log(error);
                }
                break;
            case dataString.includes("Install-Complete"):
                const modpackId = dataString.split(' ')[1];
                console.log("Install Complete: ", modpackId);
                win.webContents.send("install-complete", modpackId);
                break;
            case dataString.includes("uninstall-complete"):
                const modpackId2 = dataString.split(' ')[1];
                win.webContents.send("uninstall-complete", modpackId2);
                break;
            case dataString.includes("no-account"):
                const modpackId3 = dataString.split(' ')[0];
                win.webContents.send("error-launching", modpackId3);
                showErrorMessage("Not signed in. Please sign-in to your Microsoft account.");
                break;
            case dataString.includes("error-launching"):
                const modpackId4 = dataString.split(' ')[0];
                win.webContents.send("error-launching", modpackId4);
                showErrorMessage("Error launching game. Please confirm you are signed-in and have selected a version.");
                break;
            case dataString.includes("game-launched"):
                const modpackId5 = dataString.split(' ')[0];
                win.webContents.send("game-launched", modpackId5.toString());
                var settings = getSettings();
                if (settings.MinimizeLauncher === true) {
                    win.minimize();
                } else if (settings.ExitLauncher === true) {
                    app.quit();
                } else {
                    console.log("Game Launched!");
                }
                break;
            case dataString.includes("game-closed"):
                const modpackId6 = dataString.split(' ')[0];
                win.webContents.send("game-closed", modpackId6);
                win.show();
                break;
            case dataString.includes("settings-loaded"):
                var settings = getSettings();
                win.webContents.send('settings', settings);
                break;
            default:
                break;
        }
    });

    backendProc.on('error', (err) => {
        console.error('Failed to start C# backend', err);
    });

   isDev ? win.loadURL("http://localhost:5173/") : win.loadURL(`file://${path.join(__dirname, 'index.html')}`);

   win.webContents.on('did-finish-load', () => {
    win.webContents.insertCSS(`
        /* Hide the default symbols */
        .titlebar-overlay .titlebar-button {
            display: none !important;
        }
    `);
});

};

app.on('ready', function() {
    createWindow();
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
        title: 'uh Oh!',
        message: message,
        buttons: ['OK'],
        icon: iconPath     
    });
};

// get-installed-versions
ipcMain.on('get-installed-versions', (event, arg) => {
    var versions = getInstalledVersions();
    event.reply('installed-versions', versions);
});

// get-settings
ipcMain.on('get-settings', (event, arg) => {
    var settings = getSettings();
    event.reply('settings', settings);
});

// download-modpack <modpackModel>
ipcMain.on('download-modpack', (event, arg) => {
    backendProc.stdin.write(`download-modpack ${arg} \n`);
    console.log("installed main");
});

// download-lite-modpack <modpackModel>
ipcMain.on('download-lite-modpack', (event, arg) => {
    backendProc.stdin.write(`download-lite-modpack ${arg} \n`);
    console.log("installed lite");

});

// delete-modpack <modpackId>
ipcMain.on('delete-modpack', (event, arg) => {
    backendProc.stdin.write(`delete-modpack ${JSON.stringify(arg)}\n`);
});

// launch-game <modpackId> 
ipcMain.on('launch-game', (event, arg) => {
    backendProc.stdin.write(`launch-game ${arg}\n`);
});

// exit-game 
ipcMain.on('exit-game', (event, arg) => {
    backendProc.stdin.write(`exit-game ${arg}\n`);
});

// cancel-game <modpackId>
ipcMain.on('cancel-game', (event, arg) => {
    backendProc.stdin.write(`cancel-game ${arg}\n`);
});


// sign-in <userAccountModel>
ipcMain.on('sign-in', async (event, arg) => {
    let UserAccount = await signIn();
    if (UserAccount == null) {
        UserAccount = await signIn();
    }
    if (UserAccount) {
     await backendProc.stdin.write(`sign-in ${JSON.stringify(UserAccount)} \n`);
     event.reply('sign-in-reply', UserAccount);
    } else {
     event.reply('sign-in-failed', "Sign-in failed");
    } 
 });
 
 // sign-out <gamerTag>
 ipcMain.on('sign-out', async (event, arg) => {
     backendProc.stdin.write(`sign-out ${arg}\n`);
 });

 // change-setting <settingName> <value>
ipcMain.on('change-setting', (event, arg) => {
    backendProc.stdin.write(`change-setting ${arg[0]} ${arg[1]} \n`);
});

// show-error <errorMessage>
ipcMain.on('show-error', (event, arg) => {
    showErrorMessage(arg);
});

// open-folder <path>
ipcMain.on('open-folder', (event, p) => {    
    shell.openPath(path.join(getAppDataPath(), "Minecraft", "Instances", p));
});

// ipc call to open mml website
ipcMain.on('open-website', (event, url) => {
    shell.openExternal(url);
});

// handle window controls
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

// get-version
ipcMain.on('get-version', (event, arg) => {
    event.reply('version', app.getVersion());
});