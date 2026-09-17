export async function requestReview(): Promise<void> {
  // Rating requests are available only in the original Toss app.
}

requestReview.isSupported = () => false;
