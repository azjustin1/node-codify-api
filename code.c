#include <stdio.h>

int main()
{
    int n;
    int a[100000000000];
    int i;
    scanf("%d", &n);
    for (i = 0; i < n; i++)
    {
        a[i] = i;
    }
    for (i = 0; i < n; i++)
    {
        printf("%d\t", a[i]);
    }
    return 0;
}