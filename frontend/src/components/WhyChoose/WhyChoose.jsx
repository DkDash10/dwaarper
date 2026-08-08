import WhyChooseHeader from "./WhyChooseHeader";
import VerifiedCard from "./VerifiedCard";
import ArrivalCard from "./ArrivalCard";
import PaymentCard from "./PaymentCard";
import BookingCard from "./BookingCard";
import RatingCard from "./RatingCard";
import GuaranteeCard from "./GuaranteeCard";

export default function WhyChoose() {
  return (
    <section className="relative overflow-hidden bg-[#080808] py-20">
      {/* Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
      {/* Section Glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-cyan-500/5 blur-[180px]" />

      {/* Top Fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-cyan-500/[0.02] to-transparent" />
      <div className="relative mx-auto max-w-7xl px-6">
        <WhyChooseHeader />

        <div className="mt-20 grid grid-cols-12 gap-6">
          {/* HERO */}
          <div className="col-span-12 lg:col-span-7">
            <VerifiedCard />
          </div>

          {/* RIGHT */}
          <div className="col-span-12 flex flex-col gap-6 lg:col-span-5">
            <ArrivalCard />

            <PaymentCard />
          </div>

          {/* BOTTOM */}
          <div className="col-span-12 lg:col-span-4">
            <BookingCard />
          </div>

          <div className="col-span-12 lg:col-span-4">
            <RatingCard />
          </div>

          <div className="col-span-12 lg:col-span-4">
            <GuaranteeCard />
          </div>
        </div>
      </div>
    </section>
  );
}
