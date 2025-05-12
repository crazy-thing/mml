using CmlLib.Core.Installer.Forge;
using CmlLib.Core;
using CmlLib.Core.Auth;
using CmlLib.Core.Downloader;
using System.ComponentModel;
using CmlLib.Utils;
using CmlLib.Core.Installer.FabricMC;
using MMLCLI.Models;
using CmlLib.Core.Version;
using System.Runtime.InteropServices;

namespace MMLCLI.Core
{
    public class Installer
    {
        private static string minecraftRoot = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), "MML", "Minecraft");
        private static string minecraftRootMac = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Library", "Application Support", "MML", "Minecraft");

        private static string runtimePath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), ".minecraft", "runtime");
        private static string runtimePathLinux = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".minecraft", "runtime");
        private static string runtimePathMac = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), "Library", "Application Support", "minecraft", "runtime");

        private MinecraftPath path;
        private CMLauncher launcher;

        public CMLauncher InitializeLauncher(VersionModel version, string? modpackId = null)
        {
            try
            {
                path = new MinecraftPath();
                launcher = new CMLauncher(path);
                launcher.FileChanged += (e) => Launcher_FileChanged(e, modpackId);


                string baseRoot = RuntimeInformation.IsOSPlatform(OSPlatform.OSX) ? minecraftRootMac : minecraftRoot;
                path.BasePath = Path.Combine(baseRoot, "Instances", modpackId ?? string.Empty);

                return launcher;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error initializing launcher: " + ex.Message);
                throw;
            }
        }

        public async Task InstallForgeVersion(VersionModel version, string modpackId)
        {
            try
            {
                InitializeLauncher(version, modpackId);
                
                var forge = new MForge(launcher);
                forge.ProgressChanged += (s, e) =>
                {
                    Console.WriteLine($"{modpackId} Loader Progress: {e.ProgressPercentage:F0}% \n");
                };

                Console.WriteLine(version.mcVersion + " " + version.modLoader);
                var versionName = await forge.Install(version.mcVersion, version.modLoader); 
                Console.WriteLine($"Install-Complete {modpackId}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred installing forge version: {ex}");
            }
        }

        public async Task InstallFabricVersion(VersionModel version, string modpackId)
        {
            try
            {
                Console.WriteLine($"Installing fabric version {version.modLoader} for modpack {modpackId}");
                Console.WriteLine($"Minecraft version: {version.mcVersion}");
                CMLauncher newLauncher = InitializeLauncher(version, modpackId);
                

                launcher.ProgressChanged += (s, e) =>
                {
                    Console.WriteLine($"{modpackId} Loader Progress: {e.ProgressPercentage:F0}");
                };

                var fabricVersionLoader = new FabricVersionLoader
                {
                    LoaderVersion = version.modLoader.ToString()
                };
                Console.WriteLine($"Loader Version: {fabricVersionLoader.LoaderVersion}");
                var fabricVersions = fabricVersionLoader.GetVersionMetadatas();
                var fullName = $"fabric-loader-{version.modLoader}-{version.mcVersion}";
                Console.WriteLine(fullName);
                var fabric = fabricVersions.GetVersionMetadata(fullName);
                await fabric.SaveAsync(path);
                await newLauncher.GetAllVersionsAsync();
                Console.WriteLine($"Install-Complete {modpackId}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error installing fabric version {ex}");
                await InstallFabricVersion(version, modpackId);
            }
        }

        private void Launcher_FileChanged(DownloadFileChangedEventArgs e, string modpackId)
        {
            double progress = ((double)e.ProgressedFileCount / e.TotalFileCount) * 100;
            Console.WriteLine($"{modpackId} LauncherIn Progress: {progress:F0}%");
        }
    }
}
