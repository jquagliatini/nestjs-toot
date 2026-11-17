## Entrypoint

the cli is the entrypoint

### Help

```
node src/cli --help
```

shows the synopsis for the CLI

### Serve

```
node src/cli serve --config <config_file.json>
```

Starts the server using the configuration from <config_file.json>

### Dumpconfig

```
node src/cli dumpconfig
```

dumps the config schema to STDOUT. Simply redirect the output to a file to reference it.
