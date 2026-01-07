// Copyright (c) Your Organization.
// Licensed under the MIT License.

/**
 * Domain management for controlling which features are enabled
 */

export class Domain {
  static readonly CORE = "core";
  static readonly SEARCH = "search";
  static readonly ANALYTICS = "analytics";
  static readonly ADMIN = "admin";

  static readonly ALL_DOMAINS = [
    Domain.CORE,
    Domain.SEARCH,
    Domain.ANALYTICS,
    Domain.ADMIN,
  ];
}

export class DomainsManager {
  private enabledDomains: Set<string>;

  constructor(domains: string | string[]) {
    const domainArray = Array.isArray(domains) ? domains : [domains];
    this.enabledDomains = new Set<string>();

    for (const domain of domainArray) {
      const normalizedDomain = domain.toLowerCase().trim();

      if (normalizedDomain === "all") {
        // Enable all domains
        this.enabledDomains = new Set(Domain.ALL_DOMAINS);
        break;
      } else if (Domain.ALL_DOMAINS.includes(normalizedDomain)) {
        this.enabledDomains.add(normalizedDomain);
      } else {
        console.warn(`Unknown domain: ${domain}`);
      }
    }

    // If no valid domains were specified, default to core
    if (this.enabledDomains.size === 0) {
      console.warn("No valid domains specified, defaulting to 'core'");
      this.enabledDomains.add(Domain.CORE);
    }
  }

  /**
   * Gets the set of enabled domains
   */
  getEnabledDomains(): Set<string> {
    return this.enabledDomains;
  }

  /**
   * Checks if a specific domain is enabled
   */
  isDomainEnabled(domain: string): boolean {
    return this.enabledDomains.has(domain);
  }

  /**
   * Gets a list of enabled domain names
   */
  getEnabledDomainsList(): string[] {
    return Array.from(this.enabledDomains);
  }
}
