"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "./utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        // 보편적 토글 크기/스타일 (iOS 유사)
        "peer inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors outline-none p-0.5",
        // 상태 색상
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-gray-300",
        // 포커스 접근성
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // 비활성화
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // 손잡이: 흰색 원형, 그림자, 부드러운 이동
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform",
          // 위치 이동(좌 → 우): 패딩(2px) 고려, ON에서 약간 왼쪽으로 더 붙여 17px 이동
          "data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-[17px]",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
