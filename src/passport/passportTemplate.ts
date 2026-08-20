import { HealthPassport } from '../types';
import { getSeverityLabel } from '../theme/theme';

export function generatePassportHTML(passport: HealthPassport): string {
  const p = passport.patient;
  const anemia = passport.anemiaResult;
  const nutrition = passport.nutritionResult;

  const dateStr = new Date(passport.generatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  const followUpStr = new Date(passport.followUpDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  const hbValue = anemia?.hbEstimate?.value?.toFixed(1) || '--';
  const severityColor = anemia?.severityColor || '#1565C0';
  const severityLabel = anemia?.severity ? getSeverityLabel(anemia.severity).toUpperCase() : 'NOT EVALUATED';

  const muacValue = nutrition?.muac ? nutrition.muac.circumferenceCm.toFixed(1) + ' cm' : '--';
  const muacColor = nutrition?.muacZoneColor || '#1565C0';
  const muacLabel = nutrition?.muacZone ? nutrition.muacZone.toUpperCase() + ' ZONE' : 'NOT EVALUATED';

  let recommendationsHTML = '';
  if (anemia?.recommendations?.length) {
    recommendationsHTML += `
      <div style="margin-top: 8px;">
        <strong style="color: #1565C0; font-size: 11px;">Clinical Action Protocol:</strong>
        <ul style="margin: 2px 0 0 0; padding-left: 18px; font-size: 11px; color: #334155;">
          ${anemia.recommendations.map(r => `<li style="margin-bottom: 2px;">${r}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  if (anemia?.dosage && anemia.dosage.elementalIronMg > 0) {
    recommendationsHTML += `
      <div style="margin-top: 8px; padding: 6px 10px; background: #EEF2F6; border-left: 3px solid #1565C0; border-radius: 2px;">
        <strong style="color: #0F172A; font-size: 11px;">IFA Supplementation Prescription:</strong>
        <div style="font-size: 11px; margin-top: 2px;"><b>Dose:</b> ${anemia.dosage.elementalIronMg} mg Elemental Iron (${anemia.dosage.syrupMlPerDose} mL)</div>
        <div style="font-size: 11px;"><b>Frequency:</b> ${anemia.dosage.frequency} for ${anemia.dosage.durationWeeks} weeks (${anemia.dosage.formulation})</div>
      </div>
    `;
  }

  if (nutrition?.mealPlan) {
    recommendationsHTML += `
      <div style="margin-top: 8px;">
        <strong style="color: #00897B; font-size: 11px;">Fortified Dietary Plan (~₹${nutrition.mealPlan.totalCostINR}/day):</strong>
        <ul style="margin: 2px 0 0 0; padding-left: 18px; font-size: 11px; color: #334155;">
          ${nutrition.mealPlan.meals.map(m => `<li style="margin-bottom: 2px;"><b>${m.name}:</b> ${m.ingredients.map(i => i.name).join(', ')}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Health Passport - ${p.name}</title>
      <style>
        @page { size: A4 portrait; margin: 12mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0F172A; margin: 0; padding: 10px; background: #FFFFFF; }
        .card-container { border: 2px solid #0F172A; border-radius: 4px; overflow: hidden; background: #FFFFFF; }
        .header { background: #1565C0; color: #FFFFFF; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; }
        .header h1 { margin: 0; font-size: 18px; letter-spacing: 1px; font-weight: 700; }
        .header-sub { font-size: 10px; color: #BBDEFB; margin-top: 2px; }
        .meta-box { text-align: right; font-size: 10px; color: #FFFFFF; font-weight: 600; }
        .section { padding: 10px 16px; border-bottom: 1px solid #E2E8F0; }
        .section-title { font-size: 10px; font-weight: 700; color: #64748B; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
        .grid { display: flex; justify-content: space-between; }
        .grid-col { flex: 1; }
        .lbl { font-size: 8px; text-transform: uppercase; color: #64748B; font-weight: 700; letter-spacing: 0.5px; }
        .val { font-size: 13px; font-weight: 700; color: #0F172A; margin-top: 2px; }
        .metric-card { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #1565C0; border-radius: 2px; margin-bottom: 6px; }
        .metric-num { font-size: 18px; font-weight: 700; }
        .badge { display: inline-block; padding: 2px 6px; border-radius: 2px; font-size: 10px; font-weight: 700; }
        .follow-up { background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 2px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
        .qr-strip { display: flex; align-items: center; background: #F1F5F9; padding: 10px 16px; gap: 16px; }
        .footer { font-size: 8px; text-align: center; color: #64748B; padding: 8px; background: #FFFFFF; border-top: 1px solid #E2E8F0; }
      </style>
    </head>
    <body>

      <div class="card-container">
        <!-- Header -->
        <div class="header">
          <div>
            <h1>DIGITAL HEALTH PASSPORT</h1>
            <div class="header-sub">HemoNutri AI • Track HTAD-06 • Non-Invasive Point-of-Care Suite</div>
          </div>
          <div class="meta-box">
            <div>PASS ID: ${passport.id || 'HP-001'}</div>
            <div>DATE: ${dateStr}</div>
          </div>
        </div>

        <!-- Demographics -->
        <div class="section" style="background: #F8FAFC;">
          <div class="section-title">Patient Profile</div>
          <div class="grid">
            <div class="grid-col">
              <div class="lbl">FULL NAME</div>
              <div class="val">${p.name}</div>
            </div>
            <div class="grid-col">
              <div class="lbl">AGE / GENDER</div>
              <div class="val">${p.age} ${p.ageUnit} • ${p.gender.toUpperCase()}</div>
            </div>
            <div class="grid-col">
              <div class="lbl">WEIGHT</div>
              <div class="val">${p.weight} kg</div>
            </div>
            <div class="grid-col">
              <div class="lbl">GUARDIAN / LOCATION</div>
              <div class="val">${p.guardianName || p.village || 'Field Health Unit'}</div>
            </div>
          </div>
        </div>

        <!-- Clinical Findings -->
        <div class="section">
          <div class="section-title">Diagnostic Screening Findings</div>

          <div class="metric-card" style="border-left-color: ${severityColor};">
            <div>
              <div class="lbl">HEMOGLOBIN LEVEL (DUAL-MODALITY FUSED)</div>
              <div class="val" style="color: ${severityColor};">${hbValue} <span style="font-size:11px; color:#64748B;">g/dL</span></div>
            </div>
            <div>
              <span class="badge" style="background: ${severityColor}; color: #FFFFFF;">${severityLabel}</span>
            </div>
          </div>

          <div class="metric-card" style="border-left-color: ${muacColor};">
            <div>
              <div class="lbl">MID-UPPER ARM CIRCUMFERENCE (SPATIAL AR ANTHROPOMETRY)</div>
              <div class="val" style="color: ${muacColor};">${muacValue}</div>
            </div>
            <div>
              <span class="badge" style="background: ${muacColor}; color: #FFFFFF;">${muacLabel}</span>
            </div>
          </div>

          <!-- Follow-up Notice -->
          <div class="follow-up">
            <div>
              <div class="lbl" style="color: #92400E;">MANDATORY CLINICAL FOLLOW-UP</div>
              <div style="font-size: 12px; font-weight: 700; color: #92400E;">${followUpStr}</div>
            </div>
            <div style="font-size: 10px; color: #92400E; font-weight: 600;">Location: ${passport.facilityName}</div>
          </div>

          ${recommendationsHTML}
        </div>

        <!-- QR & Offline Sync Block -->
        <div class="qr-strip">
          <div style="background:#FFFFFF; padding:4px; border:1px solid #CBD5E1; text-align:center;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=85x85&data=${encodeURIComponent(passport.qrPayload || passport.id)}" alt="QR" width="80" height="80" onerror="this.style.display='none'" />
            <div style="font-size:7px; font-weight:700; color:#64748B; margin-top:2px;">OFFLINE QR</div>
          </div>
          <div style="flex:1;">
            <div class="lbl">DIGITAL ENCRYPTED HEALTH RECORD</div>
            <div style="font-size: 10px; color: #334155; margin-top: 2px;">
              This QR code encapsulates patient demographics, dual-modality Hb measurements, MUAC anthropometrics, and prescription metadata for instant peer-to-peer sync.
            </div>
            <div style="font-size: 9px; color: #64748B; margin-top: 4px;">
              Health Officer: <b>${passport.healthWorkerName} (${passport.healthWorkerId})</b> | Facility: <b>${passport.facilityName}</b>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          HemoNutri AI Clinical Triage System • Non-Invasive Point-of-Care Diagnostic Engine • WHO Guidelines Compliant
        </div>
      </div>

    </body>
    </html>
  `;
}
