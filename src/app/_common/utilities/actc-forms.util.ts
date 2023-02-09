export function GetLastFourYears(year:number){
    let response:Array<number> = []
    for(let i =0 ; i < 4 ;  i++ )response.push(--year)
    return response
}