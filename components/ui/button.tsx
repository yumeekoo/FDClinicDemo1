import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center transition-colors duration-150 outline-none select-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm",
        outline:
          "bg-white hover:bg-gray-50 text-gray-700 font-medium border border-gray-200 hover:border-gray-300",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200 font-medium",
        ghost:
          "bg-transparent hover:bg-gray-100 text-gray-500 hover:text-gray-700 font-medium",
        destructive:
          "bg-red-500 hover:bg-red-600 text-white font-medium",
        link: "text-blue-600 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 rounded-lg text-sm gap-2",
        sm: "h-8 px-3 rounded-md text-xs gap-1.5",
        lg: "h-11 px-8 rounded-xl text-base gap-2",
        icon: "h-9 w-9 rounded-lg p-2",
        "icon-sm": "h-7 w-7 rounded-md p-1",
        "icon-xs": "h-6 w-6 rounded-md p-0.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
