namespace MMLCLI.Models {
    public class SettingsModel
    {
        public bool MinimizeLauncher { get; set; } = true;
        public bool ExitLauncher { get; set; } = false;
        public bool RunOnStart { get; set; } = false;
        public bool DoNotRunStart { get; set; } = true;
        public string MinMem { get; set; } = "512";
        public string MaxMem { get; set; } = "6096";

    }
}
