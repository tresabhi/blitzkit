using System;
using System.Runtime.InteropServices;
using BlitzKit.FFI.Models;

namespace BlitzKit.FFI;

public static class FFI
{
  static BlitzProvider provider;

  [UnmanagedCallersOnly(EntryPoint = "debug_echo")]
  public static IntPtr DebugEcho(IntPtr inputPtr)
  {
    var input = Marshal.PtrToStringAnsi(inputPtr);
    var result = $"BlitzKit FFI echo: {input}";
    return Marshal.StringToHGlobalAnsi(result);
  }

  [UnmanagedCallersOnly(EntryPoint = "mount_game")]
  public static void DebugGetGameMountPoint(IntPtr pointPtr)
  {
    var point = Marshal.PtrToStringAnsi(pointPtr);
    provider = new(point);
  }

  [UnmanagedCallersOnly(EntryPoint = "debug_get_file_count")]
  public static int DebugGetFileCount()
  {
    return provider.Files.Count;
  }
}
