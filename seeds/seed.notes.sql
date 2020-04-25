INSERT INTO notes (name, modified, content, folder_id)
VALUES
('Dogs', now() - '15 days'::INTERVAL, 'Corporis accusamus placeat quas non voluptas. Harum fugit molestias qui.', 1),
('Cats', now() - '12 days'::INTERVAL, 'Corporis accusamus placeat quas non voluptas. Harum fugit molestias qui.', 1),
('Pigs', now() - '12 days'::INTERVAL, 'Corporis accusamus placeat quas non voluptas. Harum fugit molestias qui.', 1),
('Birds', now() - '10 days'::INTERVAL, 'Corporis accusamus placeat quas non voluptas. Harum fugit molestias qui.', 2),
('Bears', now() - '9 days'::INTERVAL, 'Corporis accusamus placeat quas non voluptas. Harum fugit molestias qui.', 2),
('Horses', now() - '9 days'::INTERVAL, 'Corporis accusamus placeat quas non voluptas. Harum fugit molestias qui.', 2),
('Tigers', now(), 'Corporis accusamus placeat quas non voluptas. Harum fugit molestias qui.', 3),
('Wolves', now(), 'Corporis accusamus placeat quas non voluptas. Harum fugit molestias qui.', 3),
('Elephants', now(), 'Corporis accusamus placeat quas non voluptas. Harum fugit molestias qui.', 3);