namespace BlitzKit.CLI.Utils
{
  public class ExplicitlySizedStream(Stream stream, long length) : Stream
  {
    private readonly Stream _stream = stream;
    private readonly long _length = length;
    private long _position = 0;

    public override bool CanRead => _stream.CanRead;
    public override bool CanSeek => _stream.CanSeek;
    public override bool CanWrite => _stream.CanWrite;

    public override long Length => _length;
    public override long Position
    {
      get => _position;
      set => _position = value;
    }

    public override void Flush() => _stream.Flush();

    public override int Read(byte[] buffer, int offset, int count)
    {
      if (_position >= _length)
        return 0; // End of stream
      var bytesRead = _stream.Read(buffer, offset, count);
      _position += bytesRead;
      return bytesRead;
    }

    public override long Seek(long offset, SeekOrigin origin)
    {
      long targetPosition = origin switch
      {
        SeekOrigin.Begin => offset,
        SeekOrigin.Current => _position + offset,
        SeekOrigin.End => _length + offset,
        _ => throw new ArgumentOutOfRangeException(nameof(origin), "Invalid SeekOrigin value."),
      };

      if (targetPosition < 0 || targetPosition > _length)
        throw new ArgumentOutOfRangeException(nameof(offset), "Seek position is out of range.");

      // Simulate seek by discarding data up to the target position
      if (targetPosition != _position)
      {
        if (targetPosition < _position)
        {
          throw new NotSupportedException(
            "Backward seeking is not supported for non-seekable streams."
          );
        }

        var toSkip = targetPosition - _position;
        Skip(toSkip);
        _position = targetPosition;
      }

      return _position;
    }

    private void Skip(long bytes)
    {
      byte[] buffer = new byte[8192];
      while (bytes > 0)
      {
        int toRead = (int)Math.Min(buffer.Length, bytes);
        int read = _stream.Read(buffer, 0, toRead);
        if (read == 0)
          throw new EndOfStreamException();
        bytes -= read;
      }
    }

    public override void SetLength(long value) => throw new NotSupportedException();

    public override void Write(byte[] buffer, int offset, int count)
    {
      _stream.Write(buffer, offset, count);
      _position += count;
    }

    // public override void Flush() => _stream.Flush();

    // public override int Read(byte[] buffer, int offset, int count) =>
    //   _stream.Read(buffer, offset, count);

    // public override long Seek(long offset, SeekOrigin origin) => _stream.Seek(offset, origin);

    // public override void SetLength(long value) => throw new NotSupportedException();

    // public override void Write(byte[] buffer, int offset, int count) =>
    //   _stream.Write(buffer, offset, count);
  }
}
