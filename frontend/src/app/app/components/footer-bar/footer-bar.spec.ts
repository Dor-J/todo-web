import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/angular';
import { FooterBar } from './footer-bar';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('FooterBar', () => {
  const setup = async () => {
    const { fixture } = await render(FooterBar, {
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    return {
      fixture,
      component: fixture.componentInstance,
    };
  };

  describe('Template Rendering', () => {
    it('should render footer content', async () => {
      await setup();

      // Footer should be rendered (exact content depends on template)
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('should display current year', async () => {
      const { component } = await setup();

      const currentYear = new Date().getFullYear();
      expect(component.year).toBe(currentYear);
    });
  });
});
