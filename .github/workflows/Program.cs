// C# Program Example
// Save as: csharp-code/Program.cs

using System;
using System.IO;

namespace ForerunnersApp
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("🔷 C# is running!");
            Console.WriteLine("✅ GitHub Actions + C# integration successful!");

            // Example: Read Excel file (if needed)
            // Use ClosedXML or EPPlus library for Excel operations
            Console.WriteLine("📊 Ready to process Excel files!");

            // Create test output
            Directory.CreateDirectory("docs");
            File.WriteAllText("docs/test_output.txt", "C# test successful! 🎉");
            Console.WriteLine("✅ Test file created: docs/test_output.txt");
        }
    }
}
