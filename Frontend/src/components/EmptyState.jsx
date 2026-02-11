import React from 'react';
import { BookOpen, Search, History, FileX, Inbox } from 'lucide-react';

const EmptyState = ({
    type = 'default',
    title,
    description,
    icon: CustomIcon,
    action
}) => {
    const presets = {
        'no-books': {
            icon: BookOpen,
            title: 'No Books Issued',
            description: 'You haven\'t issued any books yet. Visit the library to explore our collection.',
            color: 'blue'
        },
        'no-history': {
            icon: History,
            title: 'No History Available',
            description: 'Your reading history will appear here once you return books.',
            color: 'slate'
        },
        'no-results': {
            icon: Search,
            title: 'No Results Found',
            description: 'Try adjusting your search or filter to find what you\'re looking for.',
            color: 'amber'
        },
        'no-data': {
            icon: FileX,
            title: 'No Data Available',
            description: 'There\'s nothing to display at the moment.',
            color: 'slate'
        },
        'default': {
            icon: Inbox,
            title: 'Nothing Here',
            description: 'This section is currently empty.',
            color: 'slate'
        }
    };

    const preset = presets[type] || presets.default;
    const Icon = CustomIcon || preset.icon;
    const finalTitle = title || preset.title;
    const finalDescription = description || preset.description;
    const color = preset.color;

    const colorClasses = {
        blue: {
            iconBg: 'bg-blue-500/10',
            iconText: 'text-blue-400',
            border: 'border-blue-500/20'
        },
        amber: {
            iconBg: 'bg-amber-500/10',
            iconText: 'text-amber-400',
            border: 'border-amber-500/20'
        },
        slate: {
            iconBg: 'bg-slate-700/30',
            iconText: 'text-slate-500',
            border: 'border-slate-700/30'
        }
    };

    const colors = colorClasses[color] || colorClasses.slate;

    return (
        <div className={`flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed ${colors.border} rounded-xl bg-slate-900/30`}>
            <div className={`${colors.iconBg} p-6 rounded-full mb-6 animate-pulse`}>
                <Icon className={`h-12 w-12 ${colors.iconText}`} />
            </div>

            <h3 className="text-xl font-bold text-white mb-2 text-center">
                {finalTitle}
            </h3>

            <p className="text-slate-400 text-center max-w-md mb-6">
                {finalDescription}
            </p>

            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
};

export default EmptyState;
