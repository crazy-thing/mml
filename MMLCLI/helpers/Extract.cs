using System.IO.Compression;

namespace MMLCLI.Helpers {
    public static class Extract
    {
        public static async Task ExtractModpack(string filePath, string extractPath, string instancePath, string modpackId)
        {
            try
            {
                using (ZipArchive archive = ZipFile.OpenRead(filePath))
                {
                    long totalBytes = 0;
                    foreach (ZipArchiveEntry entry in archive.Entries)
                    {
                        totalBytes += entry.Length;
                    }

                    long extractedBytes = 0;
                    const int bufferSize = 4096;
                    byte[] buffer = new byte[bufferSize];

                    foreach (ZipArchiveEntry entry in archive.Entries)
                    {
                        string destinationPath = Path.Combine(extractPath, entry.FullName);
                        string destinationDirectory = Path.GetDirectoryName(destinationPath);
                        Directory.CreateDirectory(destinationDirectory);

                        if (!entry.FullName.EndsWith("/")) 
                        {
                            using (Stream source = entry.Open())
                            using (FileStream destination = File.Create(destinationPath))
                            {
                                int bytesRead;
                                while ((bytesRead = await source.ReadAsync(buffer, 0, buffer.Length)) > 0)
                                {
                                    await destination.WriteAsync(buffer, 0, bytesRead);
                                    extractedBytes += bytesRead;

                                    double progress = (double)extractedBytes / totalBytes * 100;
                                    Console.WriteLine($"{modpackId} Extract Progress: {progress:F0}%");
                                }
                            }
                        }
                    }
                }
                File.Delete(filePath);
                ExtractOverrides(instancePath);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred during extraction: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
            }
        }

        public static void ExtractOverrides(string instancePath)
        {
            try
            {
                string overridesPath = Path.Combine(instancePath, "overrides");

                // Copy files in the root of overridesPath to instancePath
                string[] files = Directory.GetFiles(overridesPath);
                foreach (string file in files)
                {
                    string fileName = Path.GetFileName(file);
                    string targetFile = Path.Combine(instancePath, fileName);
                    File.Copy(file, targetFile, true);
                }

                string[] sourceDirs = Directory.GetDirectories(overridesPath);
                string[] targetDirs = Directory.GetDirectories(instancePath);

                // Delete matching directories in instancePath
                foreach (string sourceDir in sourceDirs)
                {
                    string dirName = Path.GetFileName(sourceDir);
                    string matchingDir = Array.Find(targetDirs, d => Path.GetFileName(d) == dirName);
                    if (!string.IsNullOrEmpty(matchingDir))
                    {
                        Directory.Delete(matchingDir, true);
                    }
                }

                // Always delete "mods" and "config" directories in instancePath
                string modsDir = Path.Combine(instancePath, "mods");
                if (Directory.Exists(modsDir))
                {
                    Directory.Delete(modsDir, true);
                }

                string configDir = Path.Combine(instancePath, "config");
                if (Directory.Exists(configDir))
                {
                    Directory.Delete(configDir, true);
                }

                // Copy directories from overridesPath to instancePath
                foreach (string sourceDir in sourceDirs)
                {
                    string targetDir = Path.Combine(instancePath, Path.GetFileName(sourceDir));
                    DirectoryCopy(sourceDir, targetDir, true);
                }

                Console.WriteLine("Overrides extracted successfully.");
                Directory.Delete(overridesPath, true);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error: " + ex.Message);
            }
        }

        private static void DirectoryCopy(string sourceDirName, string destDirName, bool copySubDirs)
        {
            DirectoryInfo dir = new DirectoryInfo(sourceDirName);
            DirectoryInfo[] dirs = dir.GetDirectories();

            if (!dir.Exists)
            {
                throw new DirectoryNotFoundException("Source directory does not exist or could not be found: " + sourceDirName);
            }

            if (!Directory.Exists(destDirName))
            {
                Directory.CreateDirectory(destDirName);
            }

            FileInfo[] files = dir.GetFiles();
            foreach (FileInfo file in files)
            {
                string temppath = Path.Combine(destDirName, file.Name);
                file.CopyTo(temppath, true); // Overwrite existing files
            }

            if (copySubDirs)
            {
                foreach (DirectoryInfo subdir in dirs)
                {
                    string temppath = Path.Combine(destDirName, subdir.Name);
                    DirectoryCopy(subdir.FullName, temppath, copySubDirs);
                }
            }
        }

        public static void CompareDirectories(string instancePath, string extractedPath)
        {
            string[] existingDirs = Directory.GetDirectories(instancePath, "*", SearchOption.AllDirectories);
            string[] extractedDirs = Directory.GetDirectories(extractedPath, "*", SearchOption.AllDirectories);

            foreach (var existingDir in existingDirs)
            {
                string relativeDir = existingDir.Replace(instancePath, "").Trim('\\');
                string correspondingExtractedDir = Path.Combine(extractedPath, relativeDir);

                if (!Directory.Exists(correspondingExtractedDir))
                {
                    if (Directory.Exists(existingDir))
                    {
                        Directory.Delete(existingDir, true);
                    }
                }
            }

            foreach (var extractedDir in extractedDirs)
            {
                string relativeDir = extractedDir.Replace(extractedPath, "").Trim('\\');
                string correspondingExistingDir = Path.Combine(instancePath, relativeDir);

                if (!Directory.Exists(correspondingExistingDir))
                {
                    Directory.CreateDirectory(correspondingExistingDir);
                }
            }

            string[] existingFiles = Directory.GetFiles(instancePath, "*", SearchOption.AllDirectories);
            string[] extractedFiles = Directory.GetFiles(extractedPath, "*", SearchOption.AllDirectories);

            foreach (var existingFile in existingFiles)
            {
                string relativeFile = existingFile.Replace(instancePath, "").Trim('\\');
                string correspondingExtractedFile = Path.Combine(extractedPath, relativeFile);

                if (!File.Exists(correspondingExtractedFile))
                {
                    if (File.Exists(existingFile))
                    {
                        File.Delete(existingFile);
                    }
                }
            }

            foreach (var extractedFile in extractedFiles)
            {
                string relativeFile = extractedFile.Replace(extractedPath, "").Trim('\\');
                string correspondingExistingFile = Path.Combine(instancePath, relativeFile);

                if (!File.Exists(correspondingExistingFile))
                {
                    File.Copy(extractedFile, correspondingExistingFile);
                }
            }
        }
        
    }
}