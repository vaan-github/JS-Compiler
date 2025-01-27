const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { NodeVM } = require("vm2");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.post("/execute", (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "No code provided!" });
  }

  try {
    // Capture console.log output
    let consoleOutput = [];
    const sandbox = {
      console: {
        log: (...args) => {
          // Capture the console output in the array
          consoleOutput.push(args.join(' '));
        },
      },
    };

    const vm = new NodeVM({
      timeout: 1000, // Prevent infinite loops
      sandbox: sandbox, // Pass the custom sandbox with overridden console
    });

    // Run the code in the VM
    vm.run(code, "sandbox.js");

    // If we have captured console logs, join them and send them back as output
    const output = consoleOutput.join('\n') || 'No output returned';
    res.json({ output: output });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
