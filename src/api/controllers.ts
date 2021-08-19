import {Request, Response} from 'express';
import providers from '../../providers/providers.json';
import {isDateAvailable, isValidParams, Params, Provider} from './utils';

const getAppointments = async (req: Request, res: Response) => {

    // @ts-ignore
    const {minScore, specialty, date}: Params = req.query;

    if (!isValidParams({minScore, specialty, date})) {
        console.log('Bad parameters from the request');
        return res.status(400).send('Bad parameters');
    }

    const filterFunction = (provider: Provider) => {
        if (minScore > provider.score) {
            return false;
        }

        const caseInsensitiveSpecialities = provider.specialties.map((specialty: string) => specialty.toLowerCase());
        if (!caseInsensitiveSpecialities.includes(specialty.toLowerCase())) {
            return false;
        }

        if (!isDateAvailable(provider, date)) {
            return false;
        }

        return true;
    };

    const filteredProviders = providers.filter(filterFunction)
        .sort((firstProvider, secondProvider) => secondProvider.score - firstProvider.score)
        .map(provider => provider.name);

    console.log('Got appointments successfully.');
    res.send(filteredProviders);
};

const setAppointment = async (req: Request, res: Response) => {

    const {name, date} = req.body;

    const available = providers.find((provider: Provider) =>
        provider.name === name && isDateAvailable(provider, date)
    );

    if (available) {
        console.log('Found an available appointment');
        res.send('Appointment available.');
    } else {
        console.log('Could not found an available appointment');
        res.status(400).send('Appointment is not available.');
    }
};

export default {
    getAppointments,
    setAppointment
};
