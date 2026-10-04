import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GorillaColor, GorillaSize, GorillaVariant, GorillaVariantName } from './gorilla-variant';

@Component({
  selector: 'gorilla-host',
  template: '',
  host: { class: 'host-static', '[class.host-bound]': 'true' },
  hostDirectives: [{ directive: GorillaVariant, inputs: ['variant', 'color', 'size'] }],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {}

@Component({
  imports: [Host],
  template: `<gorilla-host
    class="author-static"
    [variant]="variant()"
    [color]="color()"
    [size]="size()"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Page {
  readonly variant = signal<GorillaVariantName>('default');
  readonly color = signal<GorillaColor>('primary');
  readonly size = signal<GorillaSize>('md');
}

@Component({
  imports: [Host],
  template: '<gorilla-host />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DefaultsPage {}

@Component({
  selector: 'gorilla-plain',
  template: '<div [class]="color()"></div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainPage {
  readonly color = signal<GorillaColor>('primary');
}

function classesOf(element: HTMLElement): string[] {
  return Array.from(element.querySelector('gorilla-host')?.classList ?? []).sort();
}

describe('GorillaVariant', () => {
  it('applies the default classes (`gorilla-variant-default`, `gorilla-color-primary`, `gorilla-size-md`)', async () => {
    const fixture = TestBed.createComponent(DefaultsPage);
    await fixture.whenStable();

    expect(classesOf(fixture.nativeElement)).toEqual(
      expect.arrayContaining([
        'gorilla-variant-default',
        'gorilla-color-primary',
        'gorilla-size-md',
      ]),
    );
  });

  it('updates the host classes when an input changes, without duplicates (E-04)', async () => {
    const fixture = TestBed.createComponent(Page);
    await fixture.whenStable();

    fixture.componentInstance.variant.set('brutalist');
    fixture.componentInstance.color.set('danger');
    fixture.componentInstance.size.set('xl');
    await fixture.whenStable();
    fixture.componentInstance.color.set('success');
    await fixture.whenStable();

    const host = fixture.nativeElement.querySelector('gorilla-host') as HTMLElement;
    const classes = host.className.split(/\s+/).filter(Boolean);
    expect(classes).toEqual([...new Set(classes)]);
    expect(classes.filter((name) => name.startsWith('gorilla-')).sort()).toEqual([
      'gorilla-color-success',
      'gorilla-size-xl',
      'gorilla-variant-brutalist',
    ]);
  });

  it('keeps static classes and classes added by the host component (E-05)', async () => {
    const fixture = TestBed.createComponent(Page);
    await fixture.whenStable();
    fixture.componentInstance.size.set('sm');
    await fixture.whenStable();

    expect(classesOf(fixture.nativeElement)).toEqual(
      expect.arrayContaining(['author-static', 'host-static', 'host-bound', 'gorilla-size-sm']),
    );
  });

  it('does not subscribe to `window` events nor use timers (E-02)', async () => {
    // Angular schedules change detection with its own timers: count them on a page without the
    // directive and expect the same number with it.
    const run = async (component: typeof Page | typeof PlainPage) => {
      const addEventListener = vi.spyOn(window, 'addEventListener');
      const setTimeoutSpy = vi.spyOn(window, 'setTimeout');
      const setIntervalSpy = vi.spyOn(window, 'setInterval');
      const fixture = TestBed.createComponent(component);
      await fixture.whenStable();
      fixture.componentInstance.color.set('info');
      await fixture.whenStable();
      const calls = [
        addEventListener.mock.calls.length,
        setTimeoutSpy.mock.calls.length,
        setIntervalSpy.mock.calls.length,
      ];
      vi.restoreAllMocks();
      return calls;
    };

    const withoutDirective = await run(PlainPage);
    const withDirective = await run(Page);

    expect(withDirective).toEqual(withoutDirective);
    expect(withDirective[0]).toBe(0);
    expect(withDirective[2]).toBe(0);
  });
});
