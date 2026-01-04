import type { OrderDetail } from "../types";

type Props = {
  tracking: OrderDetail["tracking"];
  orderStatus?: OrderDetail["status"];
};

const STEPS = [
  { key: "placed", label: "Đã đặt", icon: "check_circle" },
  { key: "packed", label: "Đã đóng gói", icon: "inventory_2" },
  { key: "shipping", label: "Đang giao", icon: "local_shipping" },
  { key: "completed", label: "Hoàn thành", icon: "verified" },
];

export default function ShippingStatus({ tracking, orderStatus }: Props) {
  // Determine current step based on order status and tracking events
  const getCurrentStepIndex = (): number => {
    // First try to get from order status
    if (orderStatus) {
      const statusMap: Record<string, number> = {
        "placed": 0,
        "packed": 1,
        "shipping": 2,
        "completed": 3,
        "cancelled": 0,
      };
      return statusMap[orderStatus] ?? 0;
    }
    
    // Fallback to tracking events
    const currentEvent = tracking.find(e => e.isCurrent);
    if (!currentEvent) return 0;
    
    const stepMap: Record<string, number> = {
      "created": 0,
      "confirmed": 0,
      "packaged": 1,
      "shipped": 2,
      "delivered": 3,
    };
    
    return stepMap[currentEvent.id] ?? 0;
  };
  
  const currentStepIndex = getCurrentStepIndex();
  
  // Calculate progress bar width
  const progressWidth = currentStepIndex >= STEPS.length - 1 
    ? 100 
    : (currentStepIndex / (STEPS.length - 1)) * 100;
  
  // Get timestamp for each step from tracking events
  const getStepTimestamp = (stepIndex: number): string | null => {
    const stepKeyMap: Record<number, string[]> = {
      0: ["created", "confirmed"],
      1: ["packaged"],
      2: ["shipped"],
      3: ["delivered"],
    };
    
    const eventIds = stepKeyMap[stepIndex] || [];
    const event = tracking.find(e => eventIds.includes(e.id));
    return event ? `${event.time} ${event.date}` : null;
  }; 

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
      <h3 className="font-bold text-lg mb-6 dark:text-white">Trạng thái vận chuyển</h3>

      {/* 1. Horizontal Stepper */}
      <div className="relative flex justify-between items-center mb-10 px-4 sm:px-10">
        {/* Connecting Line */}
        <div className="absolute top-6 left-0 w-full h-1 bg-gray-100 dark:bg-gray-700 -z-0">
           <div 
             className="h-full bg-emerald-500 transition-all duration-500" 
             style={{ width: `${progressWidth}%` }}
           ></div>
        </div>

        {STEPS.map((step, index) => {
          const isActive = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const timestamp = getStepTimestamp(index);
          
          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center gap-2">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-300
                  ${isActive 
                    ? "bg-emerald-500 border-white dark:border-gray-800 text-white shadow-md" 
                    : "bg-gray-100 dark:bg-gray-700 border-white dark:border-gray-800 text-gray-400"
                  }
                `}
              >
                <span className="material-symbols-outlined text-[24px]">{step.icon}</span>
              </div>
              <span className={`text-xs font-semibold ${isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {step.label}
              </span>
              {/* Real timestamp from tracking events */}
              {timestamp && (
                 <span className="text-[10px] text-gray-400">{timestamp}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* 2. Vertical Timeline */}
      <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
        <div className="space-y-6 relative pl-2">
           {/* Timeline line */}
           <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-gray-200 dark:bg-gray-700" />

           {tracking.map((event, idx) => {
             const isCurrent = event.isCurrent || idx === tracking.length - 1;
             return (
               <div key={event.id} className="relative flex gap-4">
                 {/* Dot */}
                 <div className={`relative z-10 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shrink-0 mt-1
                    ${isCurrent ? "bg-emerald-500 ring-2 ring-emerald-100 dark:ring-emerald-900" : "bg-gray-300 dark:bg-gray-600"}
                 `} />
                 
                 <div className="flex-1">
                   <div className={`text-sm font-semibold ${isCurrent ? "text-emerald-700 dark:text-emerald-400" : "text-gray-700 dark:text-gray-300"}`}>
                     {event.status}
                   </div>
                   <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                     {event.time} {event.date} {event.description && `- ${event.description}`}
                   </div>
                 </div>
               </div>
             );
           })}
        </div>
      </div>
    </div>
  );
}