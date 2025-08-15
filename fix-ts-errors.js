// Script simple para limpiar errores comunes de TypeScript
const fs = require('fs');
const path = require('path');

const fixes = [
  // Dashboard.tsx - agregar null check
  {
    file: 'src/components/admin/Dashboard.tsx',
    search: 'percent',
    replace: 'percent || 0'
  }
];

console.log('🔧 Aplicando fixes automáticos para errores de TypeScript...');

fixes.forEach(fix => {
  try {
    const filePath = path.join(__dirname, fix.file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Aplicar el fix solo si es necesario
    if (content.includes(fix.search) && !content.includes(fix.replace)) {
      content = content.replace(new RegExp(fix.search, 'g'), fix.replace);
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fix aplicado: ${fix.file}`);
    }
  } catch (error) {
    console.log(`❌ Error en ${fix.file}:`, error.message);
  }
});

console.log('🎉 Fixes completados');
