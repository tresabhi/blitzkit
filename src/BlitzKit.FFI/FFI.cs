using System;
using System.Runtime.InteropServices;

namespace BlitzKit.FFI;

public static class FFI
{
  [UnmanagedCallersOnly(EntryPoint = "echo")]
  public static IntPtr Echo(IntPtr inputPtr)
  {
    var input = Marshal.PtrToStringAnsi(inputPtr);
    var result = $"BlitzKit FFI echo: {input}";
    return Marshal.StringToHGlobalAnsi(result);
  }
}
