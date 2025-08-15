const fs = require('fs');

// Lista específica de archivos con URLs que aún necesitan corrección
const filesToFix = [
  'src/components/admin/CategoriesManagement.tsx',
  'src/components/admin/ReservationsManagement.tsx', 
  'src/components/admin/NewsManagement.tsx',
  'src/components/News.tsx',
  'src/components/admin/NotificationCenter.tsx',
  'src/pages/Debug.tsx',
  'src/components/admin/PageContentManagement.tsx',
  'src/components/admin/OrdersManagement.tsx',
  'src/components/admin/ProductManagement.tsx',
  'src/components/admin/CarouselManagement.tsx',
  'src/components/admin/ContactNewsletterManagement.tsx'
];

function fixUrls(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ Archivo no encontrado: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Reemplazos específicos para diferentes formatos de URLs
    content = content.replace(/(['"`])http:\/\/localhost:8000/g, '`${API_URL}');
    content = content.replace(/(['"`])localhost:8000/g, '`${API_URL}');
    
    // Casos específicos para template literals que ya tienen `
    content = content.replace(/`http:\/\/localhost:8000/g, '`${API_URL}');
    content = content.replace(/`localhost:8000/g, '`${API_URL}');
    
    // Caso específico para axios.get('http://localhost:8000...
    content = content.replace(/axios\.get\('http:\/\/localhost:8000/g, "axios.get(`${API_URL}");
    content = content.replace(/axios\.post\('http:\/\/localhost:8000/g, "axios.post(`${API_URL}");
    content = content.replace(/axios\.put\('http:\/\/localhost:8000/g, "axios.put(`${API_URL}");
    content = content.replace(/axios\.patch\('http:\/\/localhost:8000/g, "axios.patch(`${API_URL}");
    content = content.replace(/axios\.delete\('http:\/\/localhost:8000/g, "axios.delete(`${API_URL}");
    
    // Cerrar template literals correctamente - reemplazar comillas simples finales por backticks
    content = content.replace(/\$\{API_URL\}([^`]+?)'/g, '${API_URL}$1`');
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Corregido: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️ Sin URLs pendientes: ${filePath}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Error en ${filePath}:`, error.message);
    return false;
  }
}

function main() {
  console.log('🔧 Corrigiendo URLs hardcodeadas restantes...\n');
  
  let fixedFiles = 0;
  
  filesToFix.forEach(file => {
    if (fixUrls(file)) {
      fixedFiles++;
    }
  });

  console.log(`\n📊 Correcciones completadas:`);
  console.log(`   Archivos corregidos: ${fixedFiles}`);
  console.log(`   Total archivos procesados: ${filesToFix.length}`);
}

if (require.main === module) {
  main();
}
