#!/usr/bin/env node

/**
 * Script para actualizar URLs después del despliegue
 * Uso: node update-urls.js <backend-url> <frontend-url>
 */

const fs = require('fs');
const path = require('path');

const backendUrl = process.argv[2];
const frontendUrl = process.argv[3];

if (!backendUrl || !frontendUrl) {
    console.log('❌ Uso: node update-urls.js <backend-url> <frontend-url>');
    console.log('📝 Ejemplo: node update-urls.js https://my-backend.railway.app https://my-frontend.vercel.app');
    process.exit(1);
}

console.log('🔧 Actualizando URLs de despliegue...');

// Actualizar .env.production
const envProdPath = path.join(__dirname, '.env.production');
const envProdContent = `# Variables de entorno para producción
VITE_API_URL=${backendUrl}`;

fs.writeFileSync(envProdPath, envProdContent);
console.log('✅ Actualizado .env.production');

// Actualizar main.py con CORS
const mainPyPath = path.join(__dirname, 'backend', 'main.py');
let mainPyContent = fs.readFileSync(mainPyPath, 'utf8');

// Buscar y reemplazar la configuración de CORS
const corsRegex = /allow_origins=\[[\s\S]*?\],/;
const newCorsConfig = `allow_origins=[
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://localhost:3000",
        "https://*.vercel.app",
        "${frontendUrl}",  # URL específica del frontend
    ],`;

if (corsRegex.test(mainPyContent)) {
    mainPyContent = mainPyContent.replace(corsRegex, newCorsConfig);
    fs.writeFileSync(mainPyPath, mainPyContent);
    console.log('✅ Actualizado CORS en main.py');
} else {
    console.log('⚠️  No se pudo actualizar CORS automáticamente. Actualízalo manualmente.');
}

console.log('🎉 URLs actualizadas:');
console.log(`   Frontend: ${frontendUrl}`);
console.log(`   Backend:  ${backendUrl}`);
console.log('');
console.log('📝 Próximos pasos:');
console.log('1. Haz commit de los cambios: git add . && git commit -m "Update deployment URLs"');
console.log('2. Haz push: git push');
console.log('3. Railway re-desplegará automáticamente el backend');
console.log('4. Vercel re-desplegará automáticamente el frontend');
