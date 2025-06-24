package src.ServerSide.Matchmaking;

import src.ServerSide.User;

import java.util.List;

public abstract class MatchMaker implements Runnable{
    public abstract void stop();
    public abstract int add(User user) throws InterruptedException;
    public abstract int remove(User user);
    public abstract List<User> formGroup();
}
