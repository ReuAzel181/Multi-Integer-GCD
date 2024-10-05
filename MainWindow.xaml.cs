using System;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Interop;

namespace TaskbarFlasher
{
    public partial class MainWindow : Window
    {
        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool FlashWindowEx(ref FLASHWINFO pwfi);

        [StructLayout(LayoutKind.Sequential)]
        private struct FLASHWINFO
        {
            public uint cbSize;
            public IntPtr hwnd;
            public uint dwFlags;
            public uint uCount;
            public uint dwTimeout;
        }

        private const uint FLASHW_ALL = 3;
        private const uint FLASHW_TIMERNOFG = 12;

        public MainWindow()
        {
            InitializeComponent();
        }

        private void FlashTaskbar()
        {
            FLASHWINFO fInfo = new FLASHWINFO
            {
                cbSize = Convert.ToUInt32(Marshal.SizeOf(typeof(FLASHWINFO))),
                hwnd = new WindowInteropHelper(this).Handle,  // Get the window handle for WPF
                dwFlags = FLASHW_ALL | FLASHW_TIMERNOFG,
                uCount = uint.MaxValue, // Keep flashing until the window is focused
                dwTimeout = 0
            };
            FlashWindowEx(ref fInfo);
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            FlashTaskbar(); // Call the method to flash the taskbar
        }
    }
}
