export default function Container({ className = '', ...props }: React.ComponentProps<'div'>) {
  return <div className={`mx-auto max-w-wrap px-6 ${className}`} {...props} />;
}
