import svgUrl from "@salesforce-ux/design-system/assets/icons/utility-sprite/svg/symbols.svg";

interface Props {
    svgClass: string;
    iconName: string;
}

export function UtilityIcon(props: Props) {
    return (
        <svg className={props.svgClass} aria-hidden="true">
            <use xlinkHref={`${svgUrl}#${props.iconName}`}></use>
        </svg>
    );
}
