export function calculateHPFromDonation(donationValue: number) : number {
    return Math.min(9000, Math.max(5000, donationValue * 100));
}
