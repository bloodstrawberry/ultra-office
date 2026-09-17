'use client';

export default function ShareButton() {
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: '택배 배송', url });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <button type="button" onClick={share} aria-label="공유하기" className="rounded-full bg-purple-500 p-3 text-white shadow-lg">
      공유
    </button>
  );
}
