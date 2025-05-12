ALTER TABLE categories ADD COLUMN description TEXT;

-- Atualizar as políticas de segurança para incluir o novo campo
ALTER POLICY "Enable read access for authenticated users" ON categories
  USING (auth.role() = 'authenticated');

ALTER POLICY "Enable insert for authenticated users" ON categories
  WITH CHECK (auth.role() = 'authenticated');

ALTER POLICY "Enable update for authenticated users" ON categories
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

ALTER POLICY "Enable delete for authenticated users" ON categories
  USING (auth.role() = 'authenticated');
