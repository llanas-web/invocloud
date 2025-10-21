export interface ModelCommonProps {
    id: string;
    createdAt: Date;
}

export interface ModelCommonUpdateProps extends ModelCommonProps {
    updatedAt: Date;
}
