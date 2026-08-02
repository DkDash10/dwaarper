import { bookingSteps } from "./bookingData";
import { LuCheck } from "react-icons/lu";

export default function ProgressStepper({ activeStep = 0 }) {
  return (
    <div className="mt-8">

      {bookingSteps.map((step, index) => (
        <div
          key={step.id}
          className="relative flex flex-shrink-0 gap-5 pb-10 last:pb-0"
        >
          

          {/* Circle */}

          <div
            className={`
              relative
              z-10
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              transition-all
              duration-500

              ${
                index < activeStep
                  ? "border-cyan-400 bg-cyan-400 text-black"
                  : index === activeStep
                  ? "border-cyan-400 bg-cyan-400/15 text-cyan-300"
                  : "border-white/15 bg-[#111] text-white/35"
              }
            `}
          >
            {index < activeStep ? (
              <LuCheck size={16} />
            ) : (
              index + 1
            )}
          </div>

          {/* Line */}

          {index !== bookingSteps.length - 1 && (
            <div
              className={`
                absolute
                left-[17.5px]
                top-10
                h-[75px]
                w-[2px]
                -translate-x-1/2
                transition-all
                duration-700

                ${
                  index < activeStep
                    ? "bg-cyan-400"
                    : "bg-white/10"
                }
              `}
            />
          )}

          {/* Content */}

          <div>

            <h4
              className={`
                text-lg
                font-medium
                transition-all

                ${
                  index === activeStep
                    ? "text-white"
                    : "text-white/45"
                }
              `}
            >
              {step.label}
            </h4>

            <p className="mt-1 max-w-sm text-sm leading-6 text-white/40">
              {step.subtitle}
            </p>

          </div>

        </div>
      ))}

    </div>
  );
}