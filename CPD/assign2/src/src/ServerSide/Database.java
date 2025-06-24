package src.ServerSide;

import org.json.simple.JSONObject;
import org.json.simple.JSONArray;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.security.crypto.bcrypt.BCrypt;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.util.concurrent.locks.ReentrantLock;

public class Database {
    private final JSONObject database;
    private final ReentrantLock lock = new ReentrantLock();
    private final File file;
    private int token_index;
    private ReentrantLock token_lock;

    public String hashPassword(String password) throws NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] hash = md.digest(password.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            hexString.append(String.format("%02x", b));
        }
        return hexString.toString();
    }

    public Database(String filename) throws IOException, ParseException {
        this.file = new File(filename);
        if (!file.exists()) {
            createEmptyFile();
        }
        StringBuilder content = new StringBuilder();
        BufferedReader reader = new BufferedReader(new FileReader(file));
        String line;
        while ((line = reader.readLine()) != null) {
            content.append(line);
        }
        reader.close();
        this.database = (JSONObject) new JSONParser().parse(content.toString());

        // random number
        token_index = (int) (Math.random() * 1000);
        token_lock = new ReentrantLock();
    }

    private void createEmptyFile() throws IOException {
        JSONObject obj = new JSONObject();
        JSONArray users = new JSONArray();
        obj.put("users", users);

        Files.write(Paths.get(file.getPath()), obj.toJSONString().getBytes());
    }

    public void saveUser(User us) {
        lock.lock();
        try {
            JSONArray users = (JSONArray) database.get("users");
            for (Object user : users) {
                JSONObject u = (JSONObject) user;
                if (u.get("username").equals(us.getUsername())) {
                    u.put("token", us.getToken());
                    u.put("rank", us.getRank());
                    u.put("disconnectTime", us.getDisconnectTime());
                    Files.write(Paths.get(file.getPath()), database.toJSONString().getBytes());
                    return;
                }
            }
            return;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
    }

    public boolean userExists(String username) {
        lock.lock();
        try {
            JSONArray users = (JSONArray) database.get("users");
            for (Object user : users) {
                JSONObject u = (JSONObject) user;
                if (u.get("username").equals(username)) {
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
        return false;
    }

    public boolean checkPassword(String username, String password) {
        lock.lock();
        try {
            String hashedPassword = hashPassword(password);
            JSONArray users = (JSONArray) database.get("users");
            for (Object user : users) {
                JSONObject u = (JSONObject) user;
                if (u.get("username").equals(username) && u.get("password").equals(hashedPassword)) {
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
        return false;
    }

    public User getUser(String username) {
        lock.lock();
        try {
            JSONArray users = (JSONArray) database.get("users");
            for (Object user : users) {
                JSONObject u = (JSONObject) user;
                if (u.get("username").equals(username)) {
                    String token = (String) u.get("token");
                    Long rank = (Long) u.get("rank");
                    long disconnectTime = u.containsKey("disconnectTime") ? (long) u.get("disconnectTime") : -1;
                    return new User(username, token, rank, disconnectTime);
                }
            }
            return null;
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
        return null;
    }

    public String generateToken(String username) {
        this.token_lock.lock();
        int index = this.token_index;
        this.token_index++;
        this.token_lock.unlock();
        return BCrypt.hashpw(username + index, BCrypt.gensalt());
    }

    public User addUser(String username, String password) {
        lock.lock();
        try {
            String hashedPassword = hashPassword(password);
            JSONArray users = (JSONArray) database.get("users");
            for (Object user : users) {
                JSONObject u = (JSONObject) user;
                if (u.get("username").equals(username)) {
                    return null;
                }
            }
            JSONObject newUser = new JSONObject();
            newUser.put("username", username);
            newUser.put("password", hashedPassword);
            newUser.put("token", null);
            newUser.put("rank", 0);
            newUser.put("disconnectTime", -1);
            users.add(newUser);
            Files.write(Paths.get(file.getPath()), database.toJSONString().getBytes());
            return new User(username, null, 0, -1);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
        return null;
    }
}
