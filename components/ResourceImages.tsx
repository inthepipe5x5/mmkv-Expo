import React from "react";
import { ImageBackground, ImageBackgroundProps } from "react-native";
export type ResourceImageProps = { props: ImageBackgroundProps, children?: React.ReactNode }

const ResourceImageBase = ({ props, children }: ResourceImageProps) => {
    const { source } = props;
    return (
        <ImageBackground
            {...props}
            source={typeof source === 'number' ? source : { uri: typeof source === 'string' ? source : undefined }}
            style={[
                {
                    width: '100%',
                    height: '100%',
                    aspectRatio: 1,
                },
                props.style,
            ]}
            resizeMode="cover"
        >
            {!!children ? children : null}
        </ImageBackground>
    );
}

const ImageMapping = {
    households: require('@/assets/images/mike-kenneally-TD4DBagg2wE-unsplash.jpg'),
    // tasks: require('@/assets/images/andre-francois-mckenzie-8K2g0j7v4aE-unsplash.jpg'),
    tasks: require('@/assets/images/estee-janssens-aQfhbxailCs-unsplash'),
}

export const HouseholdImageBackground = ({ props, children }: ResourceImageProps) => {
    const { source, ...restProps } = props;
    return (
        <ResourceImageBase props={{
            source: source ?? ImageMapping.households, // default to households image
            ...restProps
        }}>
            {children}
        </ResourceImageBase >
    );
};

export const TaskImageBackground = ({ props, children }: ResourceImageProps) => {
    const { source, ...restProps } = props;
    return (
        <ResourceImageBase props={{
            source: source ?? ImageMapping.tasks, // default to tasks image
            ...restProps
        }}>
            {children}
        </ResourceImageBase >
    );
};