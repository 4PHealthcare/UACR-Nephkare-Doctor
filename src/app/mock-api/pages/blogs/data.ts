/* eslint-disable */
import moment from 'moment';

export const labels = [
    {
        id   : 'f47c92e5-20b9-44d9-917f-9ff4ad25dfd0',
        title: 'Published'
    },
    {
        id   : 'e2f749f5-41ed-49d0-a92a-1c83d879e371',
        title: 'Drafts'
    }
];

export const blogs = [
    {
        id       : '8f011ac5-b71c-4cd7-a317-857dcd7d85e0',
        title    : 'Find a new company name',
        content  : 'Stephanie\'s birthday is coming and I need to pick a present for her.',
        tasks    : null,
        image    : 'assets/images/cards/14-640x480.jpg',
        reminder : null,
        labels   : ['f47c92e5-20b9-44d9-917f-9ff4ad25dfd0'],
        archived : false,
        category:'Healthcare',
        createdAt: moment().hour(10).minute(19).subtract(98, 'day').toISOString(),
        updatedAt: null
    },
    {
        id       : 'ced0a1ce-051d-41a3-b080-e2161e4ae621',
        title    : 'Send the photos of last summer to John',
        content  : 'Stephanie\'s birthday is coming and I need to pick a present for her.',
        tasks    : null,
        image    : 'assets/images/cards/14-640x480.jpg',
        reminder : null,
        labels   : [
            'f47c92e5-20b9-44d9-917f-9ff4ad25dfd0',
        ],
        archived : false,
        createdAt: moment().hour(15).minute(37).subtract(80, 'day').toISOString(),
        updatedAt: null
    },
    {
        id       : 'd3ac02a9-86e4-4187-bbd7-2c965518b3a3',
        title    : 'Update the design of the theme',
        content  : 'Stephanie\'s birthday is coming and I need to pick a present for her.',
        tasks    : null,
        image    : 'assets/images/cards/17-640x480.jpg',
        reminder : null,
        labels   : ['e2f749f5-41ed-49d0-a92a-1c83d879e371'],
        archived : false,
        createdAt: moment().hour(19).minute(27).subtract(74, 'day').toISOString(),
        updatedAt: moment().hour(15).minute(36).subtract(50, 'day').toISOString()
    },
    {
        id       : '89861bd4-0144-4bb4-8b39-332ca10371d5',
        title    : 'Theming support for all apps',
        content  : 'Stephanie\'s birthday is coming and I need to pick a present for her.',
        tasks    : null,
        image    : 'assets/images/cards/14-640x480.jpg',
        reminder : moment().hour(12).minute(34).add(50, 'day').toISOString(),
        labels   : ['e2f749f5-41ed-49d0-a92a-1c83d879e371'],
        archived : false,
        createdAt: moment().hour(12).minute(34).subtract(59, 'day').toISOString(),
        updatedAt: null
    }
];
