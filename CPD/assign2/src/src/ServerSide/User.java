package src.ServerSide;

import java.io.IOException;

public class User {

    private String username;
    private String token;
    private long rank;
    private int queueTime;

    public long disconnectTime = -1;

    public long getDisconnectTime() {
        return disconnectTime;
    }

    public void setDisconnectTime(long disconnectTime) {
        this.disconnectTime = disconnectTime;
    }

    public boolean isDisconnected() {
        return disconnectTime != -1 || clientHandler == null || clientHandler.cs == null || !clientHandler.cs.isConnected();
    }

    public ClientHandler clientHandler;

    private Thread leaveThread;

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public long getRank() {
        return rank;
    }

    public void setRank(long rank) {
        this.rank = rank;
    }

    public int getQueueTime() {
        return queueTime;
    }

    public void setQueueTime(int queueTime) {
        this.queueTime = queueTime;
    }

    public void setLeaveThread(Thread thread) {
        this.leaveThread = thread;
    }

    public Thread getLeaveThread() { return leaveThread;}

    public boolean isConnected() {
        return clientHandler != null;
    }

    public User(String username, String token, long rank, long disconnectTime) throws IOException{
        this.username = username;
        this.token = token;
        this.rank = rank;
        this.queueTime = 0;
        this.clientHandler = null;
        this.disconnectTime = disconnectTime;
    }

    public void sendMessage(String message){
        clientHandler.write(message);
    }

    public String readMessage() throws IOException{
        return clientHandler.reader.readLine();
    }

    public void save() {
        clientHandler.server.db.saveUser(this);
    }

    public boolean equals(User user) {
        return this.username.equals(user.username);
    }
}
