import WhyChooseHeader from "./WhyChooseHeader";
import VerifiedCard from "./VerifiedCard";
import ArrivalCard from "./ArrivalCard";
import PaymentCard from "./PaymentCard";
import BookingCard from "./BookingCard";
import RatingCard from "./RatingCard";
import GuaranteeCard from "./GuaranteeCard";

export default function WhyChoose() {
  return (
    <section className="relative overflow-hidden bg-[#080808] py-16 sm:py-20">
      {/* Top Fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-cyan-500/[0.02] to-transparent" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
        <WhyChooseHeader />

        <div className="mt-14 grid grid-cols-12 gap-6 sm:mt-20">
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
