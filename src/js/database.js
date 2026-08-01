/* ============================================================
   WILD CONNECTIONS — Database Abstraction Layer
   Supabase (primary) + localStorage (fallback)
   ============================================================ */

(function () {
  'use strict';

  // ── Supabase Config ──────────────────────
  const SUPABASE_URL = 'https://oamabkprzvlvjgngdfes.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hbWFia3ByenZsdmpnbmdkZmVzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1NzQ5NzUsImV4cCI6MjEwMTE1MDk3NX0.RTcRVkRsjbhZdJPzkuC1Xebro3kCF54fs09KoWwHIOw';
  const TABLE_NAME = 'registrations';

  let supabase = null;

  // ── Initialize Supabase (if configured) ──
  function initSupabase() {
    if (SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase) {
      try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ WCDatabase: Supabase connected');
        return true;
      } catch (e) {
        console.warn('⚠️ WCDatabase: Supabase init failed, using localStorage', e);
        return false;
      }
    }
    console.info('ℹ️ WCDatabase: No Supabase config, using localStorage');
    return false;
  }

  // ── Public API ───────────────────────────

  const WCDatabase = {

    /**
     * Save a complete registration
     * @param {Object} data - Full registration object
     * @returns {Promise<{success: boolean, id?: string, error?: string}>}
     */
    async saveRegistration(data) {
      const record = {
        ...data,
        lastUpdated: new Date().toISOString()
      };

      // Always save to localStorage as backup
      this._saveLocal('wc_registration_data', record);

      // Try Supabase
      if (supabase) {
        try {
          const { data: result, error } = await supabase
            .from(TABLE_NAME)
            .upsert(
              {
                email: record.email || record.instagram,
                full_name: record.fullName,
                location: record.location,
                instagram: record.instagram,
                business_stage: record.businessStage,
                monthly_revenue: record.monthlyRevenue,
                business_years: record.businessYears,
                delivery_model: record.deliveryModel,
                team_size: record.teamSize,
                challenge_90days: record.challenge90Days,
                pain_points: record.painPoints,
                niche: record.niche,
                expertise: record.expertise,
                target_audience: record.targetAudience,
                ideal_client: record.idealClient,
                main_offer_price: record.mainOfferPrice,
                needs_to_hire: record.needsToHire,
                microphone_pitch: record.microphonePitch,
                hobbies: record.hobbies,
                social_energy: record.socialEnergy,
                human_design: record.humanDesign,
                my_person_criteria: record.myPersonCriteria,
                next_objective: record.nextObjective,
                three_year_vision: record.threeYearVision,
                event_expectation: record.eventExpectation,
                purchase_reason: record.purchaseReason,
                auth_directory: record.authDirectory,
                auth_matchmaking: record.authMatchmaking,
                additional_notes: record.additionalNotes,
                profile_photo_url: record.profilePhoto ? '(stored locally)' : null,
                form_complete: record.formComplete || false,
                registered_at: record.registeredAt,
                last_updated: record.lastUpdated
              },
              { onConflict: 'email' }
            );

          if (error) throw error;
          return { success: true, id: result?.[0]?.id };
        } catch (e) {
          console.warn('Supabase save failed:', e);
          return { success: true, id: 'local', error: 'Saved locally only' };
        }
      }

      return { success: true, id: 'local' };
    },

    /**
     * Get a registration by email or instagram
     * @param {string} identifier
     * @returns {Promise<Object|null>}
     */
    async getRegistration(identifier) {
      // Try Supabase first
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .or(`email.eq.${identifier},instagram.eq.${identifier}`)
            .single();

          if (!error && data) return this._mapFromDB(data);
        } catch (e) {
          console.warn('Supabase read failed:', e);
        }
      }

      // Fallback to localStorage
      return this._loadLocal('wc_registration_data');
    },

    /**
     * Get all registered users (for matching/directory)
     * @returns {Promise<Object[]>}
     */
    async getAllUsers() {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from(TABLE_NAME)
            .select('*')
            .eq('form_complete', true)
            .order('registered_at', { ascending: false });

          if (!error && data) return data.map(d => this._mapFromDB(d));
        } catch (e) {
          console.warn('Supabase read all failed:', e);
        }
      }

      // Fallback: return local data as single-element array
      const local = this._loadLocal('wc_registration_data');
      return local ? [local] : [];
    },

    /**
     * Save a partial form draft
     * @param {string} identifier
     * @param {Object} partialData
     */
    async saveDraft(identifier, partialData) {
      this._saveLocal('wc_registration_draft', {
        identifier,
        ...partialData,
        savedAt: new Date().toISOString()
      });
    },

    /**
     * Load a saved draft
     * @param {string} identifier
     * @returns {Object|null}
     */
    async getDraft(identifier) {
      return this._loadLocal('wc_registration_draft');
    },

    /**
     * Export all local data as JSON string
     * @returns {string}
     */
    exportToJSON() {
      const data = this._loadLocal('wc_registration_data');
      return JSON.stringify(data, null, 2);
    },

    /**
     * Export registration data as CSV string
     * @returns {string}
     */
    exportToCSV() {
      const data = this._loadLocal('wc_registration_data');
      if (!data) return '';

      const fields = [
        'fullName', 'location', 'instagram', 'businessStage',
        'monthlyRevenue', 'businessYears', 'teamSize', 'challenge90Days',
        'niche', 'expertise', 'idealClient', 'mainOfferPrice',
        'microphonePitch', 'socialEnergy', 'humanDesign', 'myPersonCriteria',
        'nextObjective', 'threeYearVision', 'eventExpectation',
        'registeredAt'
      ];

      const arrayFields = [
        'deliveryModel', 'painPoints', 'targetAudience',
        'needsToHire', 'hobbies', 'purchaseReason'
      ];

      const allFields = [...fields, ...arrayFields];
      const header = allFields.join(',');

      const row = allFields.map(f => {
        let val = data[f];
        if (Array.isArray(val)) val = val.join('; ');
        if (typeof val === 'string') val = '"' + val.replace(/"/g, '""') + '"';
        return val || '';
      }).join(',');

      return header + '\n' + row;
    },

    /**
     * Download export as file
     * @param {'json'|'csv'} format
     */
    downloadExport(format = 'json') {
      const content = format === 'csv' ? this.exportToCSV() : this.exportToJSON();
      const mimeType = format === 'csv' ? 'text/csv' : 'application/json';
      const ext = format === 'csv' ? 'csv' : 'json';

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wild-connections-registro.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },

    /**
     * Check if Supabase is connected
     * @returns {boolean}
     */
    isConnected() {
      return supabase !== null;
    },

    // ── Private helpers ────────────────────

    _saveLocal(key, data) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.error('localStorage save failed:', e);
      }
    },

    _loadLocal(key) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        console.error('localStorage load failed:', e);
        return null;
      }
    },

    /**
     * Map Supabase snake_case row to camelCase object
     */
    _mapFromDB(row) {
      return {
        fullName: row.full_name,
        location: row.location,
        instagram: row.instagram,
        businessStage: row.business_stage,
        monthlyRevenue: row.monthly_revenue,
        businessYears: row.business_years,
        deliveryModel: row.delivery_model,
        teamSize: row.team_size,
        challenge90Days: row.challenge_90days,
        painPoints: row.pain_points,
        niche: row.niche,
        expertise: row.expertise,
        targetAudience: row.target_audience,
        idealClient: row.ideal_client,
        mainOfferPrice: row.main_offer_price,
        needsToHire: row.needs_to_hire,
        microphonePitch: row.microphone_pitch,
        hobbies: row.hobbies,
        socialEnergy: row.social_energy,
        humanDesign: row.human_design,
        myPersonCriteria: row.my_person_criteria,
        nextObjective: row.next_objective,
        threeYearVision: row.three_year_vision,
        eventExpectation: row.event_expectation,
        purchaseReason: row.purchase_reason,
        authDirectory: row.auth_directory,
        authMatchmaking: row.auth_matchmaking,
        additionalNotes: row.additional_notes,
        formComplete: row.form_complete,
        registeredAt: row.registered_at,
        lastUpdated: row.last_updated
      };
    }
  };

  // ── Init & expose ────────────────────────
  initSupabase();
  window.WCDatabase = WCDatabase;

})();
