import { Library, types } from 'ffi-napi';
import { assertSecret } from 'packages/core/src';

export const FFI_PATH =
  '../../src/BlitzKit.FFI/bin/Release/net9.0/win-x64/publish/BlitzKit.FFI.dll';

export const ffi = Library(FFI_PATH, {
  debug_echo: [types.CString, [types.CString]],
  mount_game: ['void', [types.CString]],
  debug_get_file_count: [types.int, []],
});

ffi.mount_game(assertSecret(import.meta.env.GAME_MOUNT_POINT));
