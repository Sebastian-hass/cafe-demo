const fs = require('fs');
const path = require('path');

// Lista de archivos que necesitan ser actualizados
const filesToUpdate = [
  'src/components/admin/ContactNewsletterManagement.tsx',
  'src/components/admin/NewsManagement.tsx',
  'src/components/admin/CarouselManagement.tsx',
  'src/components/WhatsAppWidget.tsx',
  'src/components/admin/JobApplicationsManagement.tsx',
  'src/components/admin/ReservationsManagement.tsx',
  'src/components/admin/Login.tsx',
  'src/components/JobApplicationModal.tsx',
  'src/components/News.tsx',
  'src/components/admin/ProductManagement.tsx',
  'src/components/admin/Dashboard.tsx',
  'src/pages/Contact.tsx',
  'src/components/admin/CategoriesManagement.tsx',
  'src/pages/Debug.tsx',
  'src/components/admin/NotificationCenter.tsx',
  'src/components/admin/PageContentManagement.tsx',
  'src/pages/Reservations.tsx',
  'src/components/admin/OrdersManagement.tsx'
];

// Función para actualizar un archivo
function updateFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ Archivo no encontrado: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;

    // Verificar si ya tiene la importación de API_URL
    const hasApiImport = content.includes("import { API_URL } from '../config/api'") || 
                        content.includes('import { API_URL } from "../config/api"') ||
                        content.includes("import { API_URL } from '../../config/api'") ||
                        content.includes('import { API_URL } from "../../config/api"');

    // Añadir importación si no existe
    if (!hasApiImport && (content.includes('http://localhost:8000') || content.includes('localhost:8000'))) {
      // Determinar la ruta de importación correcta basada en la estructura del archivo
      const importPath = filePath.includes('/admin/') ? '../../config/api' : '../config/api';
      
      // Encontrar dónde insertar la importación
      const importRegex = /import.*from.*['"][^'"]+['"];?\s*$/gm;
      const matches = [...content.matchAll(importRegex)];
      
      if (matches.length > 0) {
        const lastImportIndex = matches[matches.length - 1].index + matches[matches.length - 1][0].length;
        content = content.slice(0, lastImportIndex) + 
                 `\nimport { API_URL } from '${importPath}';` + 
                 content.slice(lastImportIndex);
        hasChanges = true;
        console.log(`✅ Añadida importación en ${filePath}`);
      }
    }

    // Reemplazar URLs hardcodeadas
    const originalContent = content;
    content = content.replace(/['"]http:\/\/localhost:8000/g, '`${API_URL}');
    content = content.replace(/['"]localhost:8000/g, '`${API_URL}');
    content = content.replace(/\$\{API_URL\}(['"])/g, '${API_URL}');

    if (content !== originalContent) {
      hasChanges = true;
    }

    if (hasChanges) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Actualizado: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️ Sin cambios necesarios: ${filePath}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return false;
  }
}

// Función principal
function main() {
  console.log('🔧 Iniciando actualización de URLs de API...\n');
  
  let updatedFiles = 0;
  let totalFiles = filesToUpdate.length;

  filesToUpdate.forEach(file => {
    if (updateFile(file)) {
      updatedFiles++;
    }
  });

  console.log(`\n📊 Resumen:`);
  console.log(`   Archivos procesados: ${totalFiles}`);
  console.log(`   Archivos actualizados: ${updatedFiles}`);
  console.log(`   Archivos sin cambios: ${totalFiles - updatedFiles}`);
  
  if (updatedFiles > 0) {
    console.log('\n🎉 Actualización completada! Todos los archivos ahora usan API_URL.');
    console.log('💡 Asegúrate de que tu archivo .env tenga VITE_API_URL configurado correctamente.');
  } else {
    console.log('\n✨ Todos los archivos ya estaban actualizados.');
  }
}

// Ejecutar script
if (require.main === module) {
  main();
}

module.exports = { updateFile, filesToUpdate };
