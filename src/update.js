const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/NANO/Documents/mentorasVip/mentoras-vip/mentoras-vip/src';

const htmlReplacements = [
    { from: /Mentoras <span class="gold">VIP<\/span>/g, to: '<img src="assets/logos/logo-principal-blanco.png" alt="Wild Connections" class="nav-logo-img" style="height:28px">' },
    { from: /Mentoras <span class="highlight gold-underline">VIP<\/span>/g, to: 'Wild <span class="highlight gold-underline">Connections</span>' },
    { from: /Crear Cuenta VIP/g, to: 'Crear mi Perfil' },
    { from: /Plan VIP Activo/g, to: 'Plan Activo' },
    { from: /Plan VIP Mensual/g, to: 'Plan Mensual' },
    { from: /Plan VIP Trimestral/g, to: 'Plan Trimestral' },
    { from: /Plan VIP Anual/g, to: 'Plan Anual' },
    { from: /Conectar VIP/g, to: 'Conectar' },
    { from: /Suscríbete VIP/g, to: 'Suscríbete' },
    { from: /Planes VIP/g, to: 'Planes' },
    { from: /Ver Planes VIP/g, to: 'Ver Planes' },
    { from: /Matches VIP/g, to: 'Matches' },
    { from: /Nuevos Matches VIP/g, to: 'Nuevos Matches' },
    { from: /VIP MENSUAL/g, to: 'PLAN ACTIVO' },
    { from: /© 2025 Mentoras VIP\. Todos los derechos reservados\./g, to: '© 2025 Wild Goddess Magazine®. Todos los derechos reservados.' },
    { from: /Mentoras VIP — /g, to: 'Wild Connections — ' },
    { from: /Perfil VIP/g, to: 'Mi Perfil' },
    { from: /Analizando tu Perfil VIP\.\.\./g, to: 'Preparando tu experiencia...' },
    { from: /Mentoras VIP/g, to: 'Wild Connections' },
];

const jsReplacements = [
    { from: /vip_user_name/g, to: 'wc_user_name' },
    { from: /vip_user_email/g, to: 'wc_user_email' },
    { from: /vip_user_avatar/g, to: 'wc_user_avatar' },
    { from: /vip_onboarding_step/g, to: 'wc_onboarding_step' },
    { from: /vip_onboarding_answers/g, to: 'wc_onboarding_answers' },
    { from: /vip_chat_messages/g, to: 'wc_chat_messages' },
    { from: /vip_bookings/g, to: 'wc_bookings' },
    { from: /vip_matches/g, to: 'wc_matches' },
    { from: /vip_active_plan/g, to: 'wc_active_plan' },
    { from: /VIPUser/g, to: 'WCUser' },
    { from: /VIP-/g, to: 'WC-' },
    { from: /Mentoras VIP/g, to: 'Wild Connections' },
    { from: /Bienvenida a Mentoras VIP/g, to: 'Bienvenida a Wild Connections' },
    { from: /vip_/g, to: 'wc_' }
];

function processFiles(dir, ext, excludes, replacements) {
    const files = fs.readdirSync(dir);
    let changedFiles = [];
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            changedFiles = changedFiles.concat(processFiles(fullPath, ext, excludes, replacements));
        } else if (fullPath.endsWith(ext) && !excludes.some(e => fullPath.endsWith(e))) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content;
            for (const { from, to } of replacements) {
                newContent = newContent.replace(from, to);
            }
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                changedFiles.push(fullPath);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
    return changedFiles;
}

const excludes = ['register.html', 'onboarding.html', 'onboarding.js'];

console.log("HTML Updates:");
const htmlChanges = processFiles(baseDir, '.html', excludes, htmlReplacements);
console.log("JS Updates:");
const jsChanges = processFiles(path.join(baseDir, 'js'), '.js', excludes, jsReplacements);

const report = {
    html: htmlChanges,
    js: jsChanges
};

fs.writeFileSync(path.join(baseDir, 'update_report.json'), JSON.stringify(report, null, 2));
console.log("Done");
