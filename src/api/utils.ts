export interface Params {
    minScore: number,
    specialty: string,
    date: number
}

interface AvailableDate {
    from: number;
    to: number;
}

export interface Provider {
    name: string;
    score: number;
    specialties: string[];
    availableDates: AvailableDate[];
}

export const isDateAvailable = (provider: Provider, date: number) => {

    for (const dateRange of provider.availableDates) {
        if (dateRange.from <= date && dateRange.to >= date) {
            return true;
        }
    }

    return false;
};

export const isValidParams = (params: Params) => {
    const {minScore, specialty, date} = params;

    if (!minScore || !specialty || !date) {
        return false;
    }

    if (isNaN(date)) {
        return false;
    }

    return true;
};
