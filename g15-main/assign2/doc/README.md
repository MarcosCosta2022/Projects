# Assignment 2 

## Environment

We developed this project in IntelliJ IDEA using Java 21.

## Compilation

Open the src folder in intellij and add the lib dependencies by following the steps below:

Open *Project Structure* -> Open *Modules* under *Project Settings* -> *Dependencies* -> + -> *Add JARs or directories* -> Select the lib folder in the project directory


## Running the Server

File in folder ServerSide named Server.java.


Running configuration:
```bash
java Server [port] [mode]
```

- port: The port number to run the server on
- mode: The mode to run the server in. Options are:
  - 1: Casual mode
  - 2: Competitive mode

All arguments are optional. If no arguments are provided, the server will run on port 8080 in casual mode. If only the port is provided, the server will run on the specified port in casual mode. If both arguments are provided, the server will run on the specified port in the specified mode.

## Running the Client

File in folder ClientSide named Play.java.

```bash
java Play [port] [host]
```

- port: The port to connect to
- host: The host to connect to

All arguments are optional. If no arguments are provided, the client will connect to localhost on port 8080. If only the port is provided, the client will connect to localhost on the specified port. If both arguments are provided, the client will connect to the specified host on the specified port.


