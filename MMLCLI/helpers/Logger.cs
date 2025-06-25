using System.Text;

namespace MMLCLI.Helpers
{
    public class Logger : TextWriter
    {
        private readonly IEnumerable<TextWriter> writers;

        public Logger(params TextWriter[] writers)
        {
            this.writers = writers;
        }

        public override Encoding Encoding => Encoding.UTF8;

        public override void Write(char value)
        {
            foreach (var writer in writers)
            {
                writer.Write(value);
            }
        }

        public override void WriteLine(string? value)
        {
            foreach (var writer in writers)
            {
                writer.WriteLine(value);
            }
        }

        public override void Flush()
        {
            foreach (var writer in writers)
            {
                writer.Flush();
            }
        }
    }

}
