import java.util.*;
public class UtilityHelper{
    public static int[] findDuplicateEleInArr(int[] arr){
        int n=arr.length;
        Arrays.sort(arr);
        int[] ans=new int[n];
        int cnt=0;
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] == arr[i - 1]) {
                if (cnt == 0 || ans[cnt - 1] != arr[i]) {
                    ans[cnt++] = arr[i];
                }
            }
        }
        return  Arrays.copyOf(ans, cnt);
    }

}
