import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchSiteSettings } from '../utils/api';
import {
  APP_NAME,
  APP_TAGLINE,
  CONTACT_INFO,
  DEFAULT_SITE_SETTINGS,
  POLICY_LINKS,
  SHIPPING_OPTIONS,
  SOCIAL_LINKS,
} from '../utils/constants';

const SiteSettingsContext = createContext(null);

const toNumber = (value, fallback) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toBoolean = (value, fallback) => {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value) === 'true';
};

const normalizeSettings = (raw = {}) => {
  const siteName = raw.site_name?.trim() || APP_NAME;
  const siteTagline = raw.site_tagline?.trim() || APP_TAGLINE;

  return {
    siteName,
    siteTagline,
    footerDescription: raw.footer_description?.trim() || DEFAULT_SITE_SETTINGS.footer_description,
    contact: {
      address: raw.contact_address?.trim() || CONTACT_INFO.address,
      email: raw.contact_email?.trim() || CONTACT_INFO.email,
      phone: raw.contact_phone?.trim() || CONTACT_INFO.phone,
      hours: raw.contact_hours?.trim() || CONTACT_INFO.hours,
    },
    shipping: {
      freeShippingEnabled: toBoolean(
        raw.free_shipping_enabled,
        String(DEFAULT_SITE_SETTINGS.free_shipping_enabled ?? 'true') === 'true'
      ),
      freeShippingMin: toNumber(raw.free_shipping_min, toNumber(DEFAULT_SITE_SETTINGS.free_shipping_min, 50)),
      standard: {
        cost: toNumber(raw.shipping_cost, SHIPPING_OPTIONS.standard.cost),
        time: raw.standard_shipping_time?.trim() || SHIPPING_OPTIONS.standard.time,
      },
      express: {
        cost: toNumber(raw.express_shipping_cost, SHIPPING_OPTIONS.express.cost),
        time: raw.express_shipping_time?.trim() || SHIPPING_OPTIONS.express.time,
      },
      sameDay: {
        cost: toNumber(raw.same_day_shipping_cost, SHIPPING_OPTIONS.same_day.cost),
        time: raw.same_day_shipping_time?.trim() || SHIPPING_OPTIONS.same_day.time,
      },
    },
    currencySymbol: raw.currency_symbol?.trim() || DEFAULT_SITE_SETTINGS.currency_symbol,
    socialLinks: SOCIAL_LINKS.map(link => ({
      ...link,
      url: raw[`social_${link.platform}`]?.trim() || link.url,
    })),
    policyLinks: {
      privacy: raw.privacy_policy_url?.trim() || POLICY_LINKS.privacy,
      terms: raw.terms_of_service_url?.trim() || POLICY_LINKS.terms,
      refund: raw.refund_policy_url?.trim() || POLICY_LINKS.refund,
    },
    maintenanceMode: String(raw.maintenance_mode ?? DEFAULT_SITE_SETTINGS.maintenance_mode) === 'true',
    meta: {
      title: raw.meta_title?.trim() || `${siteName} | ${siteTagline}`,
      description: raw.meta_description?.trim() || DEFAULT_SITE_SETTINGS.meta_description,
    },
  };
};

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => normalizeSettings());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        const { data } = await fetchSiteSettings();
        if (mounted && data?.success) {
          setSettings(normalizeSettings(data.settings));
        }
      } catch {
        if (mounted) {
          setSettings(normalizeSettings());
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(() => ({ ...settings, loading }), [settings, loading]);

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  return context;
};

export default SiteSettingsContext;