type PluralizeProps = {
    suffix: string,
    count: number
}

const Pluralize = ({ suffix , count } : PluralizeProps) => {
  return (
    <>
    {count == 1 ? suffix.replace('$' , '') : suffix.replace('$' , 's')}
    </>
  )
}

export default Pluralize
