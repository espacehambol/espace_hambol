const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// Port on which your Next.js app is running locally or in production
const PORT = process.env.PORT || 3000;
const URL = `http://localhost:${PORT}/api/admin/crm/marketing`;

const LOG_FILE = path.join(__dirname, 'cron-marketing.log');

function logAction(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(logMessage.trim());
  fs.appendFileSync(LOG_FILE, logMessage);
}

logAction('Service Cron démarré. En attente des planifications...');

// Planification : Tous les jours à 08h00 du matin (0 8 * * *)
// Pour des tests, vous pouvez remplacer "0 8 * * *" par "*/1 * * * *" (toutes les minutes)
cron.schedule('0 8 * * *', async () => {
  logAction('Exécution de la tâche CRM : Envoi des e-mails marketing (J-2 et J+1)...');
  
  try {
    const fetch = (await import('node-fetch')).default || global.fetch;
    const res = await fetch(URL);
    
    if (res.ok) {
      const data = await res.json();
      logAction(`Succès : ${data.preArrivalCount} e-mails Pré-arrivée, ${data.postStayCount} e-mails Post-séjour.`);
      
      // Enregistrer les détails dans le log
      if (data.logs && data.logs.length > 0) {
        data.logs.forEach(log => {
          logAction(`- [${log.type}] ${log.clientName} (${log.clientEmail}) : ${log.message}`);
        });
      }
    } else {
      logAction(`Erreur lors de l'appel API : HTTP ${res.status}`);
    }
  } catch (error) {
    logAction(`Erreur de connexion (L'API Next.js est-elle lancée ?) : ${error.message}`);
  }
});
