-- Atualiza o nome do site nas configurações
UPDATE system_settings
SET site_name = 'DOT Angola'
WHERE site_name = 'Gift Card Haven';

-- Atualiza o nome do site nas notificações existentes
UPDATE notifications
SET title = REPLACE(title, 'Gift Card Haven', 'DOT Angola'),
    message = REPLACE(message, 'Gift Card Haven', 'DOT Angola')
WHERE title LIKE '%Gift Card Haven%'
   OR message LIKE '%Gift Card Haven%'; 