import Link from 'next/link';

// DESIGN.md: lg = 44px / 11px 21px / 17px, sm = 36px / 8px 15px / 14px. 980px pill.
const VARIANT = {
  primary: 'bg-primary text-on-primary',
  outline: 'border border-link text-link',
};
const SIZE = {
  lg: 'h-11 px-[21px] t-body',
  sm: 'h-9 px-[15px] t-body-sm',
};

type Props = { variant?: keyof typeof VARIANT; size?: keyof typeof SIZE; className?: string };

const cls = ({ variant = 'primary', size = 'lg', className = '' }: Props) =>
  `inline-flex items-center gap-1.5 rounded-pill font-medium cursor-pointer transition-transform duration-200 ease-standard active:scale-97 motion-reduce:transform-none ${VARIANT[variant]} ${SIZE[size]} ${className}`;

export function ButtonLink({ variant, size, className, ...props }: Props & React.ComponentProps<typeof Link>) {
  return <Link className={cls({ variant, size, className })} {...props} />;
}

export default function Button({ variant, size, className, ...props }: Props & React.ComponentProps<'button'>) {
  return <button className={cls({ variant, size, className })} {...props} />;
}
