SET DateStyle TO European;


-- Insert sample data into the 'profile' table
INSERT INTO profile (bio, birthdate, created_at)
VALUES
    ('Food lover and chef', 1983, NOW()),
    ('Bookworm and writer', 1976, NOW()),
    ('Photography enthusiast', 1989, NOW()),
    ('Film critic', 1980, NOW()),
    ('Gamer', 1996, NOW()),
    ('Musician', 1985, NOW()),
    ('Traveler and Adventurer', 1990, NOW()),
    ('Fitness Freak', 1992, NOW()),
    ('Nature Lover and Environmentalist', 1986, NOW()),
    ('Tech Geek and Programmer', 1995, NOW()),
    ('Art and Design Enthusiast', 1988, NOW());

-- Insert sample data into the 'users' table
INSERT INTO users (first_name, last_name, username, email, password, img, is_admin, profilestate, id_profile)
VALUES
    ('admin', 'admin', 'admin', 'admin@example.com' , '7110eda4d09e062aa5e4a390b0a572ac0d2c0220' , NULL , TRUE, 'Public', 1),
    ('Ella', 'Johnson', 'ellaj', 'ella@example.com', 'password789', 'ella.jpg', FALSE, 'Public', 1),
    ('James', 'Smith', 'jamess', 'james@example.com', 'pass123', 'james.png', FALSE, 'Public', 2),
    ('Mary', 'Brown', 'maryb', 'mary@example.com', 'password456', 'mary.jpg', FALSE, 'Public', 3),
    ('David', 'Wilson', 'davidw', 'david@example.com', 'password789', NULL, FALSE, 'Public', 4),
    ('Linda', 'Lee', 'lindal', 'linda@example.com', 'pass123', NULL, FALSE, 'Public', 5),
    ('Michael', 'Miller', 'michaelm', 'michael@example.com', 'password456', NULL, FALSE, 'Public', 6),
    ('Sophia', 'Moore', 'sophiam', 'sophia@example.com', 'password123', NULL, FALSE, 'Public', 7),
    ('Daniel', 'Johnson', 'danielj', 'daniel@example.com', 'pass123', 'daniel.jpg', FALSE, 'Public', 8),
    ('Ava', 'Davis', 'avad', 'ava@example.com', 'password456', 'ava.png', FALSE, 'Public', 9),
    ('William', 'Brown', 'williamw', 'william@example.com', 'password789', NULL, FALSE, 'Public', 10);

-- Insert sample data into the 'group' table
INSERT INTO groups (name, description, picture)
VALUES
    ('Foodies Club', 'Share your love for food', 'foodies.jpg'),
    ('Bookworms', 'For book enthusiasts', NULL),
    ('Photography Lovers', 'Capture the world in a frame', 'photography.jpg'),
    ('Movie Buffs', 'Discuss your favorite films', NULL),
    ('Gaming Community', 'Level up together', 'gaming.jpg'),
    ('Music Fans', 'Let the music play', NULL);

-- Insert sample data into the 'groupMember' table
INSERT INTO groupmember (id_group, id_user, isgroupadmin)
VALUES
    (5, 1, TRUE),
    (5, 2, FALSE),
    (6, 3, TRUE),
    (6, 4, FALSE),
    (1, 5, TRUE),
    (2, 6, FALSE),
    (2, 7, TRUE),
    (2, 8, FALSE),
    (3, 9, TRUE),
    (4, 10, FALSE);

-- Insert sample data into the 'friendrequest' table
INSERT INTO friendrequest (friendrequeststate, created_at, id_sender, id_receiver)
VALUES
    ('Accepted', NOW(), 4, 10),
    ('Refused', NOW(), 9, 5),
    ('Pending', NOW(), 2, 7),
    ('Accepted', NOW(), 6, 3),
    ('Refused', NOW(), 1, 8),
    ('Pending', NOW(), 5, 4),
    ('Accepted', NOW(), 7, 1),
    ('Refused', NOW(), 3, 9),
    ('Pending', NOW(), 10, 6),
    ('Accepted', NOW(), 8, 2);


-- Insert sample data into the 'post' table
INSERT INTO post (id_user, content, created_at, visibility, picture, group_id)
VALUES
    (1, 'Another post by John', NOW(), 1, 'john-post2.jpg', 5),
    (2, 'A new post from Alice', NOW(), 1, NULL, NULL),
    (3, 'Ella''s first post', NOW(), 1, 'ella-post.jpg', NULL),
    (4, 'James is sharing a photo', NOW(), 1, 'james-post3.jpg', NULL),
    (5, 'Mary is on board', NOW(), 1, NULL, NULL),
    (6, 'David''s post about coding', NOW(), 1, NULL, 2),
    (7, 'Linda''s travel adventures', NOW(), 1, 'linda-travel.jpg', NULL),
    (8, 'Michael''s fitness journey', NOW(), 1, NULL, NULL),
    (9, 'Sophia''s new painting', NOW(), 1, 'sophia-art.jpg', NULL),
    (10, 'Daniel''s tech update', NOW(), 1, 'daniel-tech.jpg', NULL);

-- Insert sample data into the 'comment' table
INSERT INTO comment (content, created_at, id_user, id_post)
VALUES
    ('Great to see you here, Ella!', NOW(), 3, 10);
    
INSERT INTO comment (content, created_at, id_user, id_post)
VALUES
    ('Nice picture, James.', NOW(), 4, 6),
    ('Keep sharing, Mary!', NOW(), 5, 5),
    ('David, you code like a pro!', NOW(), 1, 8),
    ('Linda, which place is this?', NOW(), 3, 7);

INSERT INTO comment (content, created_at, id_user, id_post)
VALUES
    ('Michael, your workout inspires!', NOW(), 4, 9),
    ('Sophia, amazing artwork!', NOW(), 5, 9),
    ('Daniel, what tech is this?', NOW(), 4, 10),
    ('Ava, your posts are delightful!', NOW(), 5, 6),
    ('William, share more with us!', NOW(), 3, 8);


-- Insert sample data into the 'follow' table
INSERT INTO follow (id_follower, id_followed)
VALUES
    ( 6, 7),
    ( 5, 10),
    ( 2, 8),
    ( 1, 4),
    ( 3, 9),
    ( 10, 5),
    ( 7, 3),
    ( 8, 6),
    ( 4, 1),
    ( 9, 2);


-- Insert sample data into the 'reaction' table
INSERT INTO reaction (liked, created_at, reactiontype, id_post, id_comment, id_user)
VALUES
    (TRUE, NOW(), 'ReactionComment', NULL, 6, 1),
    (TRUE, NOW(), 'ReactionPost', 9, NULL, 3),
    (TRUE, NOW(), 'ReactionComment', NULL, 4, 4),
    (TRUE, NOW(), 'ReactionPost', 5, NULL, 5),
    (TRUE, NOW(), 'ReactionComment', NULL, 8, 6),
    (TRUE, NOW(), 'ReactionPost', 10, NULL, 7),
    (TRUE, NOW(), 'ReactionComment', NULL, 10, 8),
    (TRUE, NOW(), 'ReactionPost', 7, NULL, 9),
    (TRUE, NOW(), 'ReactionComment', NULL, 2, 10),
    (TRUE, NOW(), 'ReactionPost', 1, NULL, 2);


-- Inserting a LikedPost notification
INSERT INTO notification (liked, created_at, notificationtype, id_reaction, id_user)
VALUES
    (TRUE, NOW(), 'LikedPost', 1, 2);

-- Inserting a CommentNotification
INSERT INTO notification (liked, created_at, notificationtype, id_comment, id_user)
VALUES
    (FALSE, NOW(), 'CommentNotification', 3, 4);

-- Inserting a FriendRequestNotification
INSERT INTO notification (liked, created_at, notificationtype, id_friendrequestSender, id_user)
VALUES
    (FALSE, NOW(), 'FriendRequestNotification', 4, 10);

-- Inserting a NewFollower notification
INSERT INTO notification (liked, created_at, notificationtype, id_follower, id_user)
VALUES
    (TRUE, NOW(), 'NewFollower', 6, 7);

-- Inserting a LikedPost notification with a read status
INSERT INTO notification (liked, created_at, notificationtype, id_reaction, id_user, read)
VALUES
    (TRUE, NOW(), 'LikedPost', 9, 10, TRUE);